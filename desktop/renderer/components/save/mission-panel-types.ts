import type {
	MissionEntry,
	SecretMissionEntry,
} from '@/lib/mission-editor-types';

export type MissionTypeFilter =
	| 'all'
	| 'primary'
	| 'encore'
	| 'prime'
	| 'secret'
	| 'unknown';

export type PresenceFilter = 'all' | 'present' | 'missing';
export type QuickMissionRank = 'D' | 'C' | 'B' | 'A' | 'P';

export type MissionGroupKey =
	| 'prelude'
	| 'act-1'
	| 'act-2'
	| 'act-3'
	| 'encore'
	| 'prime'
	| 'secret'
	| 'unknown';

export interface MissionGroupContent {
	key: string;
	label: string;
	missions: MissionEntry[];
	secretMissions: SecretMissionEntry[];
}
