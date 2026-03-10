// renderer/lib/difficulty-registry.ts

export interface DifficultyDefinition {
	id: number;
	key: string;
	name: string;
	order: number;
	group: 'accessible' | 'hard' | 'very-hard';
	isReleased: boolean;
}

export const ALL_DIFFICULTIES_ID = -1;
export const ALL_DIFFICULTIES_LABEL = 'All difficulties';

const ULTRAKILL_DIFFICULTIES: DifficultyDefinition[] = [
	{
		id: 0,
		key: 'harmless',
		name: 'Harmless',
		order: 0,
		group: 'accessible',
		isReleased: true,
	},
	{
		id: 1,
		key: 'lenient',
		name: 'Lenient',
		order: 1,
		group: 'accessible',
		isReleased: true,
	},
	{
		id: 2,
		key: 'standard',
		name: 'Standard',
		order: 2,
		group: 'hard',
		isReleased: true,
	},
	{
		id: 3,
		key: 'violent',
		name: 'Violent',
		order: 3,
		group: 'hard',
		isReleased: true,
	},
	{
		id: 4,
		key: 'brutal',
		name: 'Brutal',
		order: 4,
		group: 'very-hard',
		isReleased: true,
	},
	{
		id: 5,
		key: 'ultrakill-must-die',
		name: 'ULTRAKILL Must Die',
		order: 5,
		group: 'very-hard',
		isReleased: true,
	},
];

export function getAllDifficulties(): DifficultyDefinition[] {
	return [...ULTRAKILL_DIFFICULTIES].sort((a, b) => a.order - b.order);
}

export function getDifficultyById(
	id: number,
): DifficultyDefinition | undefined {
	return ULTRAKILL_DIFFICULTIES.find((difficulty) => difficulty.id === id);
}

export function isAllDifficultiesId(id: number): boolean {
	return id === ALL_DIFFICULTIES_ID;
}

export function getLowerDifficultyIds(id: number): number[] {
	return ULTRAKILL_DIFFICULTIES.filter((difficulty) => difficulty.id < id)
		.sort((a, b) => a.order - b.order)
		.map((difficulty) => difficulty.id);
}

export function getHigherDifficultyIds(id: number): number[] {
	return ULTRAKILL_DIFFICULTIES.filter((difficulty) => difficulty.id > id)
		.sort((a, b) => a.order - b.order)
		.map((difficulty) => difficulty.id);
}

export function getDifficultyIdsAtOrBelow(id: number): number[] {
	return ULTRAKILL_DIFFICULTIES.filter((difficulty) => difficulty.id <= id)
		.sort((a, b) => a.order - b.order)
		.map((difficulty) => difficulty.id);
}
