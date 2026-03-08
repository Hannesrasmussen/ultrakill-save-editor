import { app, BrowserWindow, ipcMain } from 'electron';
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { runCli } from './utils/cli';

const isDev = !!process.env.VITE_DEV_SERVER_URL;
const MIN_ZOOM_FACTOR = 0.5;
const MAX_ZOOM_FACTOR = 3;
const ZOOM_STEP = 0.1;
const PREFERENCES_WRITE_MAX_RETRIES = 8;
const PREFERENCES_WRITE_BASE_DELAY_MS = 50;
const preferencesWriteQueue = new Map<string, Promise<void>>();
const execFileAsync = promisify(execFile);

function clampZoomFactor(factor: number): number {
	return Math.min(MAX_ZOOM_FACTOR, Math.max(MIN_ZOOM_FACTOR, factor));
}

function setWindowZoomFactor(win: BrowserWindow, factor: number): number {
	const clamped = clampZoomFactor(Number(factor) || 1);
	win.webContents.setZoomFactor(clamped);
	const current = win.webContents.getZoomFactor();
	win.webContents.send('window-zoom-changed', current);
	return current;
}

function isZoomInShortcut(input: Electron.Input): boolean {
	const key = (input.key ?? '').toLowerCase();
	return (
		key === '+' ||
		key === '=' ||
		key === 'add' ||
		key === 'plus' ||
		key === 'numpadadd'
	);
}

function isZoomOutShortcut(input: Electron.Input): boolean {
	const key = (input.key ?? '').toLowerCase();
	return (
		key === '-' || key === '_' || key === 'subtract' || key === 'numpadsubtract'
	);
}

function isZoomResetShortcut(input: Electron.Input): boolean {
	const key = (input.key ?? '').toLowerCase();
	return key === '0' || key === 'num0' || key === 'numpad0';
}

function createWindow() {
	const win = new BrowserWindow({
		width: 1800,
		height: 1200,
		frame: false,
		titleBarStyle: 'hidden',
		webPreferences: {
			preload: path.join(__dirname, '../preload/preload.js'),
		},
	});

	if (isDev) {
		win.loadURL(process.env.VITE_DEV_SERVER_URL!);

		win.webContents.on('context-menu', () => {
			win.webContents.openDevTools();
		});
	} else {
		win.loadFile(path.join(__dirname, '../dist/index.html'));
	}

	win.webContents.on('zoom-changed', () => {
		win.webContents.send(
			'window-zoom-changed',
			win.webContents.getZoomFactor(),
		);
	});

	win.webContents.on('before-input-event', (event, input) => {
		const hasZoomModifier = input.control || input.meta;
		if (!hasZoomModifier) {
			return;
		}

		if (isZoomInShortcut(input)) {
			event.preventDefault();
			setWindowZoomFactor(win, win.webContents.getZoomFactor() + ZOOM_STEP);
			return;
		}

		if (isZoomOutShortcut(input)) {
			event.preventDefault();
			setWindowZoomFactor(win, win.webContents.getZoomFactor() - ZOOM_STEP);
			return;
		}

		if (isZoomResetShortcut(input)) {
			event.preventDefault();
			setWindowZoomFactor(win, 1);
		}
	});
}

app.whenReady().then(createWindow);

function resolvePreferencesFilePath(slotDirectory: string): string {
	const slotPath = path.resolve(slotDirectory);
	const gameRoot = path.resolve(slotPath, '..', '..');
	return path.join(gameRoot, 'Preferences', 'Prefs.json');
}

function ensureRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getErrorCode(error: unknown): string | null {
	if (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		typeof (error as { code?: unknown }).code === 'string'
	) {
		return (error as { code: string }).code;
	}

	return null;
}

function isRetryablePreferencesWriteError(error: unknown): boolean {
	const code = getErrorCode(error);
	return code === 'EBUSY' || code === 'EPERM' || code === 'EACCES';
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function writePreferencesWithRetry(
	prefsPath: string,
	data: Record<string, unknown>,
): Promise<void> {
	const payload = `${JSON.stringify(data, null, 2)}\n`;
	let attempt = 0;

	while (true) {
		try {
			await fs.writeFile(prefsPath, payload, 'utf8');
			return;
		} catch (error) {
			if (
				!isRetryablePreferencesWriteError(error) ||
				attempt >= PREFERENCES_WRITE_MAX_RETRIES
			) {
				throw error;
			}

			const delay = PREFERENCES_WRITE_BASE_DELAY_MS * 2 ** attempt;
			attempt += 1;
			await sleep(delay);
		}
	}
}

async function isProcessRunning(imageName: string): Promise<boolean> {
	try {
		const { stdout } = await execFileAsync('tasklist', [
			'/FI',
			`IMAGENAME eq ${imageName}`,
			'/FO',
			'CSV',
			'/NH',
		]);

		const normalized = stdout.toLowerCase();
		if (normalized.includes('no tasks are running')) {
			return false;
		}

		return normalized
			.split(/\r?\n/)
			.some((line) => line.trim().startsWith(`"${imageName.toLowerCase()}"`));
	} catch (error) {
		console.error('Failed to query running processes:', error);
		return false;
	}
}

ipcMain.handle('scan-saves', async () => {
	return runCli('scan');
});

ipcMain.handle('decode-save', async (_event, slotDirectory?: string) => {
	return runCli('decode-save', slotDirectory ? [slotDirectory] : []);
});

ipcMain.handle('is-ultrakill-running', async () => {
	return isProcessRunning('ULTRAKILL.exe');
});

ipcMain.handle('read-preferences', async (_event, slotDirectory?: string) => {
	if (!slotDirectory) {
		return { path: null, data: null };
	}

	const prefsPath = resolvePreferencesFilePath(slotDirectory);

	try {
		const raw = await fs.readFile(prefsPath, 'utf8');
		const trimmed = raw.trim();

		if (!trimmed) {
			return { path: prefsPath, data: {} };
		}

		const parsed = JSON.parse(trimmed);

		if (!ensureRecord(parsed)) {
			throw new Error('Preferences file is not a JSON object.');
		}

		return { path: prefsPath, data: parsed };
	} catch (error) {
		const errorCode =
			typeof error === 'object' && error !== null && 'code' in error
				? String((error as { code?: string }).code)
				: null;

		if (errorCode === 'ENOENT') {
			return { path: prefsPath, data: {} };
		}

		throw error;
	}
});

ipcMain.handle(
	'write-preferences',
	async (_event, slotDirectory?: string, data?: unknown) => {
		if (!slotDirectory) {
			throw new Error('A slot directory is required to write preferences.');
		}

		if (!ensureRecord(data)) {
			throw new Error('Preferences payload must be a JSON object.');
		}

		const prefsPath = resolvePreferencesFilePath(slotDirectory);

		await fs.mkdir(path.dirname(prefsPath), { recursive: true });
		const priorWrite =
			preferencesWriteQueue.get(prefsPath) ?? Promise.resolve();
		const queuedWrite = priorWrite
			.catch(() => undefined)
			.then(() => writePreferencesWithRetry(prefsPath, data));

		preferencesWriteQueue.set(prefsPath, queuedWrite);

		try {
			await queuedWrite;
		} catch (error) {
			if (isRetryablePreferencesWriteError(error)) {
				throw new Error(
					`Preferences file is busy: ${prefsPath}. Close ULTRAKILL/Steam Cloud activity and retry.`,
				);
			}

			throw error;
		} finally {
			if (preferencesWriteQueue.get(prefsPath) === queuedWrite) {
				preferencesWriteQueue.delete(prefsPath);
			}
		}

		return { path: prefsPath };
	},
);

ipcMain.on('window-minimize', (event) => {
	BrowserWindow.fromWebContents(event.sender)?.minimize();
});

ipcMain.on('window-maximize', (event) => {
	const win = BrowserWindow.fromWebContents(event.sender);
	if (win?.isMaximized()) {
		win.unmaximize();
	} else {
		win?.maximize();
	}
});

ipcMain.on('window-close', (event) => {
	BrowserWindow.fromWebContents(event.sender)?.close();
});

ipcMain.handle('window-get-zoom-factor', (event) => {
	const win = BrowserWindow.fromWebContents(event.sender);
	return win?.webContents.getZoomFactor() ?? 1;
});

ipcMain.handle('window-set-zoom-factor', (event, factor: number) => {
	const win = BrowserWindow.fromWebContents(event.sender);
	if (!win) {
		return 1;
	}

	return setWindowZoomFactor(win, factor);
});

ipcMain.handle('window-reset-zoom-factor', (event) => {
	const win = BrowserWindow.fromWebContents(event.sender);
	if (!win) {
		return 1;
	}

	return setWindowZoomFactor(win, 1);
});
