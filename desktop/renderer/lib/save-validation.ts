export type SaveHealth = 'healthy' | 'warning' | 'invalid';
export type SaveIssueSeverity = 'warning' | 'error';

export type SaveIssue = {
	code: string;
	severity: SaveIssueSeverity;
	message: string;
	file?: string;
	field?: string;
};

export type SaveValidationResult = {
	health: SaveHealth;
	issues: SaveIssue[];
	summary: {
		errorCount: number;
		warningCount: number;
	};
};

export type DecodedSave = {
	directory: string;
	levels: Record<string, unknown>;
	special: Record<string, unknown>;
	other: Record<string, unknown>;
};

type LevelStat = {
	time?: number;
	kills?: number;
	style?: number;
};

const REQUIRED_OTHER_FILES = ['generalprogress.bepis'];

const LEVEL_FILE_RE = /^lvl(\d+)progress\.bepis$/i;
const DIFFICULTY_FILE_RE = /^difficulty(\d+)progress\.bepis$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNumberArray(value: unknown): value is number[] {
	return (
		Array.isArray(value) && value.every((item) => typeof item === 'number')
	);
}

function isBooleanArray(value: unknown): value is boolean[] {
	return (
		Array.isArray(value) && value.every((item) => typeof item === 'boolean')
	);
}

function isLevelStat(value: unknown): value is LevelStat {
	if (!isRecord(value)) {
		return false;
	}

	if ('time' in value && typeof value.time !== 'number') {
		return false;
	}

	if ('kills' in value && typeof value.kills !== 'number') {
		return false;
	}

	if ('style' in value && typeof value.style !== 'number') {
		return false;
	}

	return true;
}

function isLevelStatArray(value: unknown): value is Array<LevelStat | null> {
	return (
		Array.isArray(value) &&
		value.every((item) => item === null || isLevelStat(item))
	);
}

function pushIssue(
	issues: SaveIssue[],
	severity: SaveIssueSeverity,
	code: string,
	message: string,
	file?: string,
	field?: string,
) {
	issues.push({
		code,
		severity,
		message,
		file,
		field,
	});
}

function validateRootShape(save: unknown, issues: SaveIssue[]) {
	if (!isRecord(save)) {
		pushIssue(
			issues,
			'error',
			'root.invalid',
			'Decoded save is not an object.',
		);
		return;
	}

	if (typeof save.directory !== 'string' || !save.directory.trim()) {
		pushIssue(
			issues,
			'error',
			'root.directory.missing',
			'Save directory is missing or invalid.',
		);
	}

	if (!isRecord(save.levels)) {
		pushIssue(
			issues,
			'error',
			'root.levels.invalid',
			'Save levels group is missing or invalid.',
		);
	}

	if (!isRecord(save.special)) {
		pushIssue(
			issues,
			'error',
			'root.special.invalid',
			'Save special group is missing or invalid.',
		);
	}

	if (!isRecord(save.other)) {
		pushIssue(
			issues,
			'error',
			'root.other.invalid',
			'Save other group is missing or invalid.',
		);
	}
}

function validateRequiredFiles(save: DecodedSave, issues: SaveIssue[]) {
	for (const file of REQUIRED_OTHER_FILES) {
		if (!(file in save.other)) {
			pushIssue(
				issues,
				'error',
				'file.required.missing',
				`Required save file is missing: ${file}`,
				file,
			);
		}
	}
}

function validateGeneralProgressFile(save: DecodedSave, issues: SaveIssue[]) {
	const file = 'generalprogress.bepis';
	const entry = save.other[file];

	if (entry === undefined) {
		return;
	}

	if (!isRecord(entry)) {
		pushIssue(
			issues,
			'error',
			'file.invalid_shape',
			`${file} is not an object.`,
			file,
		);
		return;
	}

	if ('money' in entry && typeof entry.money !== 'number') {
		pushIssue(
			issues,
			'warning',
			'field.type.unexpected',
			'Field "money" should be a number.',
			file,
			'money',
		);
	}

	if ('money' in entry && typeof entry.money === 'number' && entry.money < 0) {
		pushIssue(
			issues,
			'warning',
			'field.value.suspicious',
			'Field "money" is negative.',
			file,
			'money',
		);
	}
}

function validateDifficultyProgressFiles(
	save: DecodedSave,
	issues: SaveIssue[],
) {
	for (const [file, value] of Object.entries(save.other)) {
		if (!DIFFICULTY_FILE_RE.test(file)) {
			continue;
		}

		if (!isRecord(value)) {
			pushIssue(
				issues,
				'error',
				'file.invalid_shape',
				`${file} is not an object.`,
				file,
			);
			continue;
		}

		if ('difficulty' in value && typeof value.difficulty !== 'number') {
			pushIssue(
				issues,
				'warning',
				'field.type.unexpected',
				'Field "difficulty" should be a number.',
				file,
				'difficulty',
			);
		}

		if ('levelNum' in value && typeof value.levelNum !== 'number') {
			pushIssue(
				issues,
				'warning',
				'field.type.unexpected',
				'Field "levelNum" should be a number.',
				file,
				'levelNum',
			);
		}

		if ('encores' in value && typeof value.encores !== 'number') {
			pushIssue(
				issues,
				'warning',
				'field.type.unexpected',
				'Field "encores" should be a number.',
				file,
				'encores',
			);
		}

		if ('primeLevels' in value && !isNumberArray(value.primeLevels)) {
			pushIssue(
				issues,
				'warning',
				'field.array_shape.unexpected',
				'Field "primeLevels" should be a number array.',
				file,
				'primeLevels',
			);
		}
	}
}

function validateLevelEntry(file: string, value: unknown, issues: SaveIssue[]) {
	if (!isRecord(value)) {
		pushIssue(
			issues,
			'error',
			'file.invalid_shape',
			`${file} is not an object.`,
			file,
		);
		return;
	}

	const match = file.match(LEVEL_FILE_RE);
	const expectedLevelNumber = match ? Number(match[1]) : null;

	if ('levelNumber' in value && typeof value.levelNumber !== 'number') {
		pushIssue(
			issues,
			'warning',
			'field.type.unexpected',
			'Field "levelNumber" should be a number.',
			file,
			'levelNumber',
		);
	}

	if (
		expectedLevelNumber !== null &&
		typeof value.levelNumber === 'number' &&
		value.levelNumber !== expectedLevelNumber
	) {
		pushIssue(
			issues,
			'warning',
			'field.level_number.mismatch',
			`levelNumber does not match file name. Expected ${expectedLevelNumber}, got ${value.levelNumber}.`,
			file,
			'levelNumber',
		);
	}

	if ('ranks' in value && !isNumberArray(value.ranks)) {
		pushIssue(
			issues,
			'warning',
			'field.array_shape.unexpected',
			'Field "ranks" should be a number array.',
			file,
			'ranks',
		);
	}

	if ('secretsFound' in value && !isBooleanArray(value.secretsFound)) {
		pushIssue(
			issues,
			'warning',
			'field.array_shape.unexpected',
			'Field "secretsFound" should be a boolean array.',
			file,
			'secretsFound',
		);
	}

	if ('challenge' in value && typeof value.challenge !== 'boolean') {
		pushIssue(
			issues,
			'warning',
			'field.type.unexpected',
			'Field "challenge" should be a boolean.',
			file,
			'challenge',
		);
	}

	if ('majorAssists' in value && !isBooleanArray(value.majorAssists)) {
		pushIssue(
			issues,
			'warning',
			'field.array_shape.unexpected',
			'Field "majorAssists" should be a boolean array.',
			file,
			'majorAssists',
		);
	}

	if ('stats' in value && !isLevelStatArray(value.stats)) {
		pushIssue(
			issues,
			'warning',
			'field.array_shape.unexpected',
			'Field "stats" should be an array of stat objects or null values.',
			file,
			'stats',
		);
	}

	if ('secretsAmount' in value) {
		if (typeof value.secretsAmount !== 'number') {
			pushIssue(
				issues,
				'warning',
				'field.type.unexpected',
				'Field "secretsAmount" should be a number.',
				file,
				'secretsAmount',
			);
		} else if (value.secretsAmount < 0) {
			pushIssue(
				issues,
				'warning',
				'field.value.suspicious',
				'Field "secretsAmount" is negative.',
				file,
				'secretsAmount',
			);
		}
	}

	if (
		typeof value.secretsAmount === 'number' &&
		isBooleanArray(value.secretsFound)
	) {
		const secretsAmount = value.secretsAmount;
		const tooLong = value.secretsFound.length > secretsAmount;

		if (tooLong) {
			pushIssue(
				issues,
				'warning',
				'field.value.inconsistent',
				'secretsFound has more entries than secretsAmount.',
				file,
				'secretsFound',
			);
		}
	}
}

function validateLevelGroups(save: DecodedSave, issues: SaveIssue[]) {
	for (const [file, value] of Object.entries(save.levels)) {
		if (!LEVEL_FILE_RE.test(file)) {
			pushIssue(
				issues,
				'warning',
				'file.unknown_name',
				`Unexpected level file name in levels group: ${file}`,
				file,
			);
			continue;
		}

		validateLevelEntry(file, value, issues);
	}

	for (const [file, value] of Object.entries(save.special)) {
		if (!LEVEL_FILE_RE.test(file)) {
			pushIssue(
				issues,
				'warning',
				'file.unknown_name',
				`Unexpected special file name in special group: ${file}`,
				file,
			);
			continue;
		}

		validateLevelEntry(file, value, issues);
	}
}

function validateOtherFiles(save: DecodedSave, issues: SaveIssue[]) {
	for (const [file, value] of Object.entries(save.other)) {
		if (file === 'generalprogress.bepis') {
			continue;
		}

		if (DIFFICULTY_FILE_RE.test(file)) {
			continue;
		}

		if (file === 'cybergrindhighscore.bepis') {
			if (!isRecord(value)) {
				pushIssue(
					issues,
					'warning',
					'file.invalid_shape',
					`${file} is not an object.`,
					file,
				);
			}
			continue;
		}

		if (!file.endsWith('.bepis')) {
			pushIssue(
				issues,
				'warning',
				'file.unknown_non_bepis',
				`Unexpected non-.bepis file in other group: ${file}`,
				file,
			);
		}
	}
}

export function validateSave(save: unknown): SaveValidationResult {
	const issues: SaveIssue[] = [];

	validateRootShape(save, issues);

	if (
		!isRecord(save) ||
		!isRecord(save.levels) ||
		!isRecord(save.special) ||
		!isRecord(save.other)
	) {
		const errorCount = issues.filter(
			(issue) => issue.severity === 'error',
		).length;
		const warningCount = issues.filter(
			(issue) => issue.severity === 'warning',
		).length;

		return {
			health: 'invalid',
			issues,
			summary: {
				errorCount,
				warningCount,
			},
		};
	}

	const decodedSave = save as DecodedSave;

	validateRequiredFiles(decodedSave, issues);
	validateGeneralProgressFile(decodedSave, issues);
	validateDifficultyProgressFiles(decodedSave, issues);
	validateLevelGroups(decodedSave, issues);
	validateOtherFiles(decodedSave, issues);

	const errorCount = issues.filter(
		(issue) => issue.severity === 'error',
	).length;
	const warningCount = issues.filter(
		(issue) => issue.severity === 'warning',
	).length;

	const health: SaveHealth =
		errorCount > 0 ? 'invalid' : warningCount > 0 ? 'warning' : 'healthy';

	return {
		health,
		issues,
		summary: {
			errorCount,
			warningCount,
		},
	};
}
