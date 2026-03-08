import type { UltrakillMissionDefinition } from '@/lib/mission-registry';

export interface MissionStat {
	time?: number;
	kills?: number;
	style?: number;
}

export interface DecodedMissionProgress {
	ranks?: number[];
	secretsAmount?: number;
	secretsFound?: boolean[];
	challenge?: boolean;
	levelNumber?: number;
	majorAssists?: boolean[];
	stats?: Array<MissionStat | null>;
}

export interface MissionEntry {
	fileName: string;
	mission: UltrakillMissionDefinition | null;
	existsInSave: boolean;
	isModified: boolean;
	data: DecodedMissionProgress;
	rank: number | null;
	stats: MissionStat | null;
	majorAssist: boolean;
	secretsFoundCount: number;
	secretsAmount: number;
	challengeCompleted: boolean;
}

export interface SecretMissionEntry {
	code: string;
	name: string;
	group:
		| 'prelude'
		| 'act-1'
		| 'act-2'
		| 'act-3'
		| 'encore'
		| 'prime'
		| 'unknown';
	groupLabel: string;
	secretIndex: number;
	screenshotCandidates: string[];
	stateValue: number;
	unlocked: boolean;
	completed: boolean;
	isModified: boolean;
}
