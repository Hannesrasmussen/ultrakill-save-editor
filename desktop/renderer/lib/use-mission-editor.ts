import { computed, ref, watch } from 'vue';

import { loadedSave } from '@/lib/app-state';
import {
	type MissionFinalRankLabel,
	getMissionRankFromStatRanks,
	getMissionStatRank,
	getMissionStatValueForRank,
	getMissionStatsForRank,
	type MissionStatCategory,
	type MissionStatRankLabel,
} from '@/lib/mission-rank-requirements';
import {
	getKnownEncoreMissions,
	getKnownPrimaryMissions,
	getKnownPrimeMissions,
	getKnownSecretMissions,
	getMissionByFileName,
	type SecretMissionDefinition,
	type UltrakillMissionDefinition,
} from '@/lib/mission-registry';
import type { QuickMissionRank } from '@/components/save/mission-panel-types';
import type {
	DecodedMissionProgress,
	MissionStat,
	SecretMissionEntry,
	MissionEntry,
} from '@/lib/mission-editor-types';

type GeneralProgress = Record<string, unknown>;
const DIFFICULTY_SLOT_COUNT = 6;
const RANK_VALUE_BY_QUICK_LABEL: Record<QuickMissionRank, number> = {
	D: 0,
	C: 1,
	B: 2,
	A: 3,
	P: 12,
};
const RANK_VALUE_BY_FINAL_LABEL: Record<MissionFinalRankLabel, number> = {
	D: 0,
	C: 1,
	B: 2,
	A: 3,
	S: 4,
	P: 12,
};

export function useMissionEditor(selectedDifficultyId: { value: number }) {
	const editableMissionData = ref<Record<string, DecodedMissionProgress>>({});
	const originalMissionData = ref<Record<string, DecodedMissionProgress>>({});

	const editableSecretMissionValues = ref<number[]>([]);
	const originalSecretMissionValues = ref<number[]>([]);

	function createDefaultMissionProgress(
		levelId: number,
	): DecodedMissionProgress {
		return {
			ranks: [-1, -1, -1, -1, -1, -1],
			secretsAmount: 0,
			secretsFound: [],
			challenge: false,
			levelNumber: levelId,
			majorAssists: [false, false, false, false, false, false],
			stats: [null, null, null, null, null, null],
		};
	}

	function cloneMissionProgress(
		data: DecodedMissionProgress,
	): DecodedMissionProgress {
		return {
			...data,
			ranks: data.ranks ? [...data.ranks] : undefined,
			secretsAmount: data.secretsAmount ?? 0,
			secretsFound: data.secretsFound ? [...data.secretsFound] : [],
			challenge: data.challenge ?? false,
			levelNumber: data.levelNumber,
			majorAssists: data.majorAssists ? [...data.majorAssists] : undefined,
			stats: data.stats
				? data.stats.map((stat) => (stat ? { ...stat } : null))
				: undefined,
		};
	}

	function normalizeRanks(ranks: number[] | undefined): number[] {
		const normalized = ranks ? [...ranks] : [];

		while (normalized.length < DIFFICULTY_SLOT_COUNT) {
			normalized.push(-1);
		}

		return normalized;
	}

	function normalizeMajorAssists(
		majorAssists: boolean[] | undefined,
	): boolean[] {
		const normalized = majorAssists ? [...majorAssists] : [];

		while (normalized.length < DIFFICULTY_SLOT_COUNT) {
			normalized.push(false);
		}

		return normalized;
	}

	function normalizeStats(
		stats: Array<MissionStat | null> | undefined,
	): Array<MissionStat | null> {
		const normalized = stats
			? stats.map((stat) => (stat ? { ...stat } : null))
			: [];

		while (normalized.length < DIFFICULTY_SLOT_COUNT) {
			normalized.push(null);
		}

		return normalized;
	}

	function readDifficultyNumericField(
		source: DecodedMissionProgress,
		keys: string[],
	): number {
		const record = source as Record<string, unknown>;

		for (const key of keys) {
			const value = record[key];

			if (typeof value === 'number' && Number.isFinite(value)) {
				return Math.max(0, Math.floor(value));
			}

			if (Array.isArray(value)) {
				const slot = value[selectedDifficultyId.value];
				if (typeof slot === 'number' && Number.isFinite(slot)) {
					return Math.max(0, Math.floor(slot));
				}
			}
		}

		return 0;
	}

	function readDifficultyBooleanField(
		source: DecodedMissionProgress,
		keys: string[],
	): boolean {
		const record = source as Record<string, unknown>;

		for (const key of keys) {
			const value = record[key];

			if (typeof value === 'boolean') {
				return value;
			}

			if (typeof value === 'number') {
				return value > 0;
			}

			if (Array.isArray(value)) {
				const slot = value[selectedDifficultyId.value];

				if (typeof slot === 'boolean') {
					return slot;
				}

				if (typeof slot === 'number') {
					return slot > 0;
				}
			}
		}

		return false;
	}

	function getCheckpointRestartPenalty(source: DecodedMissionProgress): number {
		return readDifficultyNumericField(source, [
			'checkpointRestarts',
			'checkpointRestartCount',
			'restarts',
			'restartCount',
		]);
	}

	function hasCheatsEnabled(source: DecodedMissionProgress): boolean {
		return readDifficultyBooleanField(source, [
			'cheats',
			'cheated',
			'cheatsUsed',
			'usedCheats',
			'isCheated',
		]);
	}

	function applyMissionRank(
		missionData: DecodedMissionProgress,
		fileName: string,
		rank: QuickMissionRank,
	): DecodedMissionProgress {
		const nextData: DecodedMissionProgress = {
			...missionData,
		};

		const mission = getMissionByFileName(fileName);
		const statRank: MissionStatRankLabel = rank === 'P' ? 'S' : rank;
		const rankStats =
			mission?.isKnown === true
				? getMissionStatsForRank(mission.code, statRank)
				: null;

		if (rankStats) {
			const stats = normalizeStats(missionData.stats);
			stats[selectedDifficultyId.value] = { ...rankStats };
			nextData.stats = stats;
		}

		if (rank === 'P') {
			const majorAssists = normalizeMajorAssists(missionData.majorAssists);
			majorAssists[selectedDifficultyId.value] = false;
			nextData.majorAssists = majorAssists;
		}

		const ranks = normalizeRanks(missionData.ranks);

		if (mission?.isKnown) {
			const derived = getMissionRankFromStats(mission.code, nextData);
			ranks[selectedDifficultyId.value] =
				derived === null ? -1 : RANK_VALUE_BY_FINAL_LABEL[derived];
		} else {
			ranks[selectedDifficultyId.value] = RANK_VALUE_BY_QUICK_LABEL[rank];
		}

		nextData.ranks = ranks;

		return nextData;
	}

	function getMissionRankFromStats(
		code: string,
		missionData: DecodedMissionProgress,
	): MissionFinalRankLabel | null {
		const stats = missionData.stats?.[selectedDifficultyId.value] ?? null;

		if (!stats) {
			return null;
		}

		const timeRank = getMissionStatRank(code, 'time', stats.time);
		const killsRank = getMissionStatRank(code, 'kills', stats.kills);
		const styleRank = getMissionStatRank(code, 'style', stats.style);

		if (!timeRank || !killsRank || !styleRank) {
			return null;
		}

		return getMissionRankFromStatRanks(
			{
				time: timeRank,
				kills: killsRank,
				style: styleRank,
			},
			{
				checkpointRestarts: getCheckpointRestartPenalty(missionData),
				majorAssistsEnabled:
					missionData.majorAssists?.[selectedDifficultyId.value] ?? false,
				cheatsEnabled: hasCheatsEnabled(missionData),
			},
		);
	}

	function serializeMissionProgress(data: DecodedMissionProgress): string {
		return JSON.stringify({
			ranks: data.ranks ?? [],
			secretsAmount: data.secretsAmount ?? 0,
			secretsFound: data.secretsFound ?? [],
			challenge: data.challenge ?? false,
			levelNumber: data.levelNumber ?? null,
			majorAssists: data.majorAssists ?? [],
			stats: data.stats ?? [],
		});
	}

	function decodeSecretMissionState(value: number) {
		if (value >= 2) {
			return {
				unlocked: true,
				completed: true,
			};
		}

		if (value >= 1) {
			return {
				unlocked: true,
				completed: false,
			};
		}

		return {
			unlocked: false,
			completed: false,
		};
	}

	function encodeSecretMissionState(
		unlocked: boolean,
		completed: boolean,
	): number {
		if (completed) {
			return 2;
		}

		if (unlocked) {
			return 1;
		}

		return 0;
	}

	function mutateAllMissionProgress(
		mutator: (
			missionData: DecodedMissionProgress,
			fileName: string,
		) => DecodedMissionProgress,
	) {
		const nextState: Record<string, DecodedMissionProgress> = {};

		for (const [fileName, data] of Object.entries(editableMissionData.value)) {
			nextState[fileName] = mutator(cloneMissionProgress(data), fileName);
		}

		editableMissionData.value = nextState;
	}

	watch(
		loadedSave,
		(save) => {
			if (!save) {
				editableMissionData.value = {};
				originalMissionData.value = {};
				editableSecretMissionValues.value = [];
				originalSecretMissionValues.value = [];
				return;
			}

			const knownMissions = [
				...getKnownPrimaryMissions(),
				...getKnownEncoreMissions(),
				...getKnownPrimeMissions(),
			];

			const loadedMissionFiles = {
				...save.levels,
				...save.special,
			};

			const nextEditableState: Record<string, DecodedMissionProgress> = {};
			const nextOriginalState: Record<string, DecodedMissionProgress> = {};

			for (const mission of knownMissions) {
				const existingData = loadedMissionFiles[mission.fileName] as
					| DecodedMissionProgress
					| undefined;

				const baseData =
					existingData ?? createDefaultMissionProgress(mission.id);

				nextEditableState[mission.fileName] = cloneMissionProgress(baseData);
				nextOriginalState[mission.fileName] = cloneMissionProgress(baseData);
			}

			for (const [fileName, rawData] of Object.entries(loadedMissionFiles)) {
				if (!nextEditableState[fileName]) {
					const cloned = cloneMissionProgress(
						rawData as DecodedMissionProgress,
					);
					nextEditableState[fileName] = cloned;
					nextOriginalState[fileName] = cloneMissionProgress(cloned);
				}
			}

			const general = (save.other['generalprogress.bepis'] ??
				null) as GeneralProgress | null;

			const secretMissionValues = Array.isArray(general?.secretMissions)
				? general.secretMissions.map((value) =>
						typeof value === 'number' ? value : 0,
					)
				: [];

			editableMissionData.value = nextEditableState;
			originalMissionData.value = nextOriginalState;
			editableSecretMissionValues.value = [...secretMissionValues];
			originalSecretMissionValues.value = [...secretMissionValues];
		},
		{ immediate: true },
	);

	const missionEntries = computed<MissionEntry[]>(() => {
		if (!loadedSave.value) {
			return [];
		}

		const knownMissions = [
			...getKnownPrimaryMissions(),
			...getKnownEncoreMissions(),
			...getKnownPrimeMissions(),
		];

		const knownMissionMap = new Map<number, UltrakillMissionDefinition>(
			knownMissions.map((mission) => [mission.id, mission]),
		);

		const loadedMissionFiles = {
			...loadedSave.value.levels,
			...loadedSave.value.special,
		};

		const entriesFromKnownMissions = knownMissions.map((mission) => {
			const existsInSave = Object.hasOwn(loadedMissionFiles, mission.fileName);

			const data =
				editableMissionData.value[mission.fileName] ??
				createDefaultMissionProgress(mission.id);

			const originalData =
				originalMissionData.value[mission.fileName] ??
				createDefaultMissionProgress(mission.id);

			const rank = data.ranks?.[selectedDifficultyId.value] ?? null;
			const stats = data.stats?.[selectedDifficultyId.value] ?? null;
			const majorAssist =
				data.majorAssists?.[selectedDifficultyId.value] ?? false;
			const secretsFoundCount = data.secretsFound?.filter(Boolean).length ?? 0;
			const secretsAmount = data.secretsAmount ?? 0;
			const challengeCompleted = data.challenge ?? false;
			const isModified =
				serializeMissionProgress(data) !==
				serializeMissionProgress(originalData);

			return {
				fileName: mission.fileName,
				mission,
				existsInSave,
				isModified,
				data,
				rank,
				stats,
				majorAssist,
				secretsFoundCount,
				secretsAmount,
				challengeCompleted,
			};
		});

		const unknownExistingEntries = Object.entries(editableMissionData.value)
			.map(([fileName, data]) => {
				const mission = getMissionByFileName(fileName);

				if (!mission || knownMissionMap.has(mission.id)) {
					return null;
				}

				const originalData = originalMissionData.value[fileName] ?? data;
				const rank = data.ranks?.[selectedDifficultyId.value] ?? null;
				const stats = data.stats?.[selectedDifficultyId.value] ?? null;
				const majorAssist =
					data.majorAssists?.[selectedDifficultyId.value] ?? false;
				const secretsFoundCount =
					data.secretsFound?.filter(Boolean).length ?? 0;
				const secretsAmount = data.secretsAmount ?? 0;
				const challengeCompleted = data.challenge ?? false;
				const isModified =
					serializeMissionProgress(data) !==
					serializeMissionProgress(originalData);

				return {
					fileName,
					mission,
					existsInSave: true,
					isModified,
					data,
					rank,
					stats,
					majorAssist,
					secretsFoundCount,
					secretsAmount,
					challengeCompleted,
				};
			})
			.filter((entry): entry is NonNullable<typeof entry> => entry !== null);

		return [...entriesFromKnownMissions, ...unknownExistingEntries].sort(
			(a, b) => {
				const aId = a.mission?.id ?? Number.MAX_SAFE_INTEGER;
				const bId = b.mission?.id ?? Number.MAX_SAFE_INTEGER;
				return aId - bId;
			},
		);
	});

	const secretMissionEntries = computed<SecretMissionEntry[]>(() => {
		const definitions = getKnownSecretMissions();

		return definitions.map((definition: SecretMissionDefinition) => {
			const currentValue =
				editableSecretMissionValues.value[definition.secretIndex] ?? 0;
			const originalValue =
				originalSecretMissionValues.value[definition.secretIndex] ?? 0;

			const state = decodeSecretMissionState(currentValue);

			return {
				code: definition.code,
				name: definition.name,
				group: definition.group,
				groupLabel: definition.groupLabel,
				secretIndex: definition.secretIndex,
				screenshotCandidates: definition.screenshotCandidates,
				stateValue: currentValue,
				unlocked: state.unlocked,
				completed: state.completed,
				isModified: currentValue !== originalValue,
			};
		});
	});

	const modifiedMissionCount = computed(
		() => missionEntries.value.filter((entry) => entry.isModified).length,
	);

	const modifiedSecretMissionCount = computed(
		() => secretMissionEntries.value.filter((entry) => entry.isModified).length,
	);

	const modifiedEntryCount = computed(
		() => modifiedMissionCount.value + modifiedSecretMissionCount.value,
	);

	const hasUnsavedMissionChanges = computed(() => modifiedEntryCount.value > 0);

	function updateChallengeCompleted(fileName: string, value: boolean) {
		const current = editableMissionData.value[fileName];
		if (!current) {
			return;
		}

		editableMissionData.value[fileName] = {
			...current,
			challenge: value,
		};
	}

	function updateMajorAssist(fileName: string, value: boolean) {
		const current = editableMissionData.value[fileName];
		if (!current) {
			return;
		}

		const majorAssists = current.majorAssists
			? [...current.majorAssists]
			: [false, false, false, false, false, false];

		majorAssists[selectedDifficultyId.value] = value;

		const nextData: DecodedMissionProgress = {
			...current,
			majorAssists,
		};

		const mission = getMissionByFileName(fileName);
		if (mission?.isKnown) {
			const ranks = normalizeRanks(nextData.ranks);
			const derived = getMissionRankFromStats(mission.code, nextData);
			ranks[selectedDifficultyId.value] =
				derived === null ? -1 : RANK_VALUE_BY_FINAL_LABEL[derived];
			nextData.ranks = ranks;
		}

		editableMissionData.value[fileName] = nextData;
	}

	function updateSecretFound(fileName: string, index: number, value: boolean) {
		const current = editableMissionData.value[fileName];
		if (!current) {
			return;
		}

		const secretsAmount = current.secretsAmount ?? 0;
		const secretsFound = current.secretsFound
			? [...current.secretsFound]
			: Array.from({ length: secretsAmount }, () => false);

		while (secretsFound.length < secretsAmount) {
			secretsFound.push(false);
		}

		secretsFound[index] = value;

		editableMissionData.value[fileName] = {
			...current,
			secretsFound,
		};
	}

	function fillSecrets(fileName: string) {
		const current = editableMissionData.value[fileName];
		if (!current) {
			return;
		}

		const secretsAmount = current.secretsAmount ?? 0;

		editableMissionData.value[fileName] = {
			...current,
			secretsFound: Array.from({ length: secretsAmount }, () => true),
		};
	}

	function clearSecrets(fileName: string) {
		const current = editableMissionData.value[fileName];
		if (!current) {
			return;
		}

		const secretsAmount = current.secretsAmount ?? 0;

		editableMissionData.value[fileName] = {
			...current,
			secretsFound: Array.from({ length: secretsAmount }, () => false),
		};
	}

	function updateSecretMissionUnlocked(secretIndex: number, value: boolean) {
		const currentValue = editableSecretMissionValues.value[secretIndex] ?? 0;
		const currentState = decodeSecretMissionState(currentValue);

		const nextValue = encodeSecretMissionState(
			value,
			value ? currentState.completed : false,
		);

		editableSecretMissionValues.value = [
			...editableSecretMissionValues.value.slice(0, secretIndex),
			nextValue,
			...editableSecretMissionValues.value.slice(secretIndex + 1),
		];
	}

	function updateSecretMissionCompleted(secretIndex: number, value: boolean) {
		const currentValue = editableSecretMissionValues.value[secretIndex] ?? 0;
		const currentState = decodeSecretMissionState(currentValue);

		const nextUnlocked = value ? true : currentState.unlocked;
		const nextValue = encodeSecretMissionState(nextUnlocked, value);

		editableSecretMissionValues.value = [
			...editableSecretMissionValues.value.slice(0, secretIndex),
			nextValue,
			...editableSecretMissionValues.value.slice(secretIndex + 1),
		];
	}

	function updateMissionRank(fileName: string, rank: QuickMissionRank) {
		const current = editableMissionData.value[fileName];
		if (!current) {
			return;
		}

		editableMissionData.value[fileName] = applyMissionRank(
			cloneMissionProgress(current),
			fileName,
			rank,
		);
	}

	function updateMissionStatRank(
		fileName: string,
		category: MissionStatCategory,
		rank: MissionStatRankLabel,
	) {
		const current = editableMissionData.value[fileName];
		if (!current) {
			return;
		}

		const mission = getMissionByFileName(fileName);
		if (!mission?.isKnown) {
			return;
		}

		const statValue = getMissionStatValueForRank(mission.code, category, rank);
		if (statValue === null) {
			return;
		}

		const stats = normalizeStats(current.stats);
		const currentStat = stats[selectedDifficultyId.value] ?? {};
		const nextStat: MissionStat = {
			...currentStat,
			[category]: statValue,
		};

		stats[selectedDifficultyId.value] = nextStat;

		const nextRanks = normalizeRanks(current.ranks);
		const nextData: DecodedMissionProgress = {
			...cloneMissionProgress(current),
			stats,
			ranks: nextRanks,
		};

		const nextMissionRank = getMissionRankFromStats(mission.code, nextData);
		nextRanks[selectedDifficultyId.value] =
			nextMissionRank === null
				? -1
				: RANK_VALUE_BY_FINAL_LABEL[nextMissionRank];

		if (nextMissionRank === 'P') {
			const majorAssists = normalizeMajorAssists(current.majorAssists);
			majorAssists[selectedDifficultyId.value] = false;
			nextData.majorAssists = majorAssists;
		}

		editableMissionData.value[fileName] = nextData;
	}

	function setAllMissionRanks(rank: QuickMissionRank) {
		mutateAllMissionProgress((missionData, fileName) => {
			return applyMissionRank(missionData, fileName, rank);
		});
	}

	function setAllMissionSecrets(value: boolean) {
		mutateAllMissionProgress((missionData) => {
			const secretsAmount = Math.max(0, missionData.secretsAmount ?? 0);

			return {
				...missionData,
				secretsFound: Array.from({ length: secretsAmount }, () => value),
			};
		});
	}

	function setAllMissionChallenges(value: boolean) {
		mutateAllMissionProgress((missionData) => ({
			...missionData,
			challenge: value,
		}));
	}

	function completeAllMissions() {
		mutateAllMissionProgress((missionData) => {
			const secretsAmount = Math.max(0, missionData.secretsAmount ?? 0);

			return {
				...missionData,
				challenge: true,
				secretsFound: Array.from({ length: secretsAmount }, () => true),
			};
		});

		const secretDefinitions = getKnownSecretMissions();
		const maxSecretIndex = secretDefinitions.reduce(
			(max, definition) => Math.max(max, definition.secretIndex),
			-1,
		);
		const targetLength = Math.max(
			editableSecretMissionValues.value.length,
			maxSecretIndex + 1,
		);

		editableSecretMissionValues.value = Array.from(
			{ length: targetLength },
			() => 2,
		);
	}

	return {
		missionEntries,
		secretMissionEntries,
		modifiedMissionCount,
		modifiedSecretMissionCount,
		modifiedEntryCount,
		hasUnsavedMissionChanges,
		updateChallengeCompleted,
		updateMajorAssist,
		updateSecretFound,
		fillSecrets,
		clearSecrets,
		updateSecretMissionUnlocked,
		updateSecretMissionCompleted,
		updateMissionRank,
		updateMissionStatRank,
		completeAllMissions,
		setAllMissionRanks,
		setAllMissionSecrets,
		setAllMissionChallenges,
	};
}
