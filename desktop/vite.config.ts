import path from 'node:path';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

const packageJson = JSON.parse(
	readFileSync(path.resolve(__dirname, './package.json'), 'utf-8'),
) as { version?: string };

export default defineConfig({
	root: 'renderer',
	plugins: [vue(), tailwindcss()],
	define: {
		__APP_VERSION__: JSON.stringify(`v${packageJson.version ?? '0.0.0'}`),
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './renderer'),
		},
	},
});
