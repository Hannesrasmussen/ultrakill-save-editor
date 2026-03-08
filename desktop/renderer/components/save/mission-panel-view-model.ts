import type {
	MissionEntry,
	SecretMissionEntry,
} from '@/lib/mission-editor-types';
import type {
	MissionGroupContent,
	MissionGroupKey,
	MissionTypeFilter,
	PresenceFilter,
} from '@/components/save/mission-panel-types';

interface MissionFilterState {
	searchQuery: string;
	typeFilter: MissionTypeFilter;
	presenceFilter: PresenceFilter;
}

const SECRET_GROUP_KEY = 'secret';
const SECRET_GROUP_LABEL = 'Secret Levels';

export function filterMissionEntries(
	missionEntries: MissionEntry[],
	filterState: MissionFilterState,
): MissionEntry[] {
	const query = filterState.searchQuery.trim().toLowerCase();

	return missionEntries.filter((entry) => {
		const mission = entry.mission;

		if (filterState.typeFilter !== 'all') {
			if ((mission?.type ?? 'unknown') !== filterState.typeFilter) {
				return false;
			}
		}

		if (filterState.presenceFilter === 'present' && !entry.existsInSave) {
			return false;
		}

		if (filterState.presenceFilter === 'missing' && entry.existsInSave) {
			return false;
		}

		if (!query) {
			return true;
		}

		const haystack = [
			mission?.code ?? '',
			mission?.name ?? '',
			mission?.groupLabel ?? '',
			entry.fileName,
		]
			.join(' ')
			.toLowerCase();

		return haystack.includes(query);
	});
}

export function filterSecretMissionEntries(
	secretMissionEntries: SecretMissionEntry[],
	filterState: MissionFilterState,
): SecretMissionEntry[] {
	const query = filterState.searchQuery.trim().toLowerCase();

	if (filterState.typeFilter !== 'all' && filterState.typeFilter !== 'secret') {
		return [];
	}

	if (filterState.presenceFilter !== 'all') {
		return [];
	}

	return secretMissionEntries.filter((entry) => {
		if (!query) {
			return true;
		}

		const haystack = [entry.code, entry.name, entry.groupLabel]
			.join(' ')
			.toLowerCase();

		return haystack.includes(query);
	});
}

export function buildMissionGroups(
	missionEntries: MissionEntry[],
	secretMissionEntries: SecretMissionEntry[],
	groupOrder: MissionGroupKey[],
): MissionGroupContent[] {
	const groups = new Map<string, MissionGroupContent>();

	for (const groupKey of groupOrder) {
		groups.set(groupKey, {
			key: groupKey,
			label: '',
			missions: [],
			secretMissions: [],
		});
	}

	for (const entry of missionEntries) {
		const mission = entry.mission;
		const key = mission?.group ?? 'unknown';
		const label = mission?.groupLabel ?? 'Unknown';

		if (!groups.has(key)) {
			groups.set(key, {
				key,
				label,
				missions: [],
				secretMissions: [],
			});
		}

		const target = groups.get(key)!;
		target.label = label;
		target.missions.push(entry);
	}

	for (const entry of secretMissionEntries) {
		const key = SECRET_GROUP_KEY;
		const label = SECRET_GROUP_LABEL;

		if (!groups.has(key)) {
			groups.set(key, {
				key,
				label,
				missions: [],
				secretMissions: [],
			});
		}

		const target = groups.get(key)!;
		target.label = label;
		target.secretMissions.push(entry);
	}

	return Array.from(groups.values())
		.map((group) => ({
			...group,
			missions: group.missions.sort((a, b) => {
				const aOrder = a.mission?.sortOrder ?? Number.MAX_SAFE_INTEGER;
				const bOrder = b.mission?.sortOrder ?? Number.MAX_SAFE_INTEGER;
				return aOrder - bOrder;
			}),
			secretMissions: group.secretMissions.sort(
				(a, b) => a.secretIndex - b.secretIndex,
			),
		}))
		.filter(
			(group) => group.missions.length > 0 || group.secretMissions.length > 0,
		);
}
