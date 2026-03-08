import { getMissionScreenshotCandidates } from '@/lib/mission-screenshots';

export const MISSION_TYPE_PRIMARY = 'primary';
export const MISSION_TYPE_ENCORE = 'encore';
export const MISSION_TYPE_PRIME = 'prime';
export const MISSION_TYPE_SECRET = 'secret';
export const MISSION_TYPE_UNKNOWN = 'unknown';

export type UltrakillMissionType =
	| typeof MISSION_TYPE_PRIMARY
	| typeof MISSION_TYPE_ENCORE
	| typeof MISSION_TYPE_PRIME
	| typeof MISSION_TYPE_SECRET
	| typeof MISSION_TYPE_UNKNOWN;

export const MISSION_GROUP_PRELUDE = 'prelude';
export const MISSION_GROUP_ACT_1 = 'act-1';
export const MISSION_GROUP_ACT_2 = 'act-2';
export const MISSION_GROUP_ACT_3 = 'act-3';
export const MISSION_GROUP_ENCORE = 'encore';
export const MISSION_GROUP_PRIME = 'prime';
export const MISSION_GROUP_UNKNOWN = 'unknown';

export type UltrakillMissionGroup =
	| typeof MISSION_GROUP_PRELUDE
	| typeof MISSION_GROUP_ACT_1
	| typeof MISSION_GROUP_ACT_2
	| typeof MISSION_GROUP_ACT_3
	| typeof MISSION_GROUP_ENCORE
	| typeof MISSION_GROUP_PRIME
	| typeof MISSION_GROUP_UNKNOWN;

export interface UltrakillMissionDefinition {
	id: number;
	code: string;
	name: string;
	type: UltrakillMissionType;
	group: UltrakillMissionGroup;
	groupLabel: string;
	sortOrder: number;
	fileName: string;
	screenshotCandidates: string[];
	isKnown: boolean;
}

export interface SecretMissionDefinition {
	code: string;
	name: string;
	group: UltrakillMissionGroup;
	groupLabel: string;
	sortOrder: number;
	secretIndex: number;
	screenshotCandidates: string[];
}

type KnownMissionSeed = {
	id: number;
	code: string;
	name: string;
	type: UltrakillMissionType;
	group: UltrakillMissionGroup;
	sortOrder: number;
};

type SecretMissionSeed = {
	code: string;
	name: string;
	group: UltrakillMissionGroup;
	sortOrder: number;
	secretIndex: number;
};

const GROUP_LABEL_PRELUDE = 'Prelude';
const GROUP_LABEL_ACT_1 = 'Act I · Infinite Hyperdeath';
const GROUP_LABEL_ACT_2 = 'Act II · Imperfect Hatred';
const GROUP_LABEL_ACT_3 = 'Act III · Godfist Suicide';
const GROUP_LABEL_ENCORE = 'Encores';
const GROUP_LABEL_PRIME = 'Prime Sanctums';
const GROUP_LABEL_UNKNOWN = 'Unknown';

const MISSION_GROUP_LABELS: Record<UltrakillMissionGroup, string> = {
	[MISSION_GROUP_PRELUDE]: GROUP_LABEL_PRELUDE,
	[MISSION_GROUP_ACT_1]: GROUP_LABEL_ACT_1,
	[MISSION_GROUP_ACT_2]: GROUP_LABEL_ACT_2,
	[MISSION_GROUP_ACT_3]: GROUP_LABEL_ACT_3,
	[MISSION_GROUP_ENCORE]: GROUP_LABEL_ENCORE,
	[MISSION_GROUP_PRIME]: GROUP_LABEL_PRIME,
	[MISSION_GROUP_UNKNOWN]: GROUP_LABEL_UNKNOWN,
};

function createKnownMissionDefinition(
	seed: KnownMissionSeed,
): Omit<UltrakillMissionDefinition, 'isKnown'> {
	return {
		id: seed.id,
		code: seed.code,
		name: seed.name,
		type: seed.type,
		group: seed.group,
		groupLabel: MISSION_GROUP_LABELS[seed.group],
		sortOrder: seed.sortOrder,
		fileName: `lvl${seed.id}progress.bepis`,
		screenshotCandidates: getMissionScreenshotCandidates(seed.code),
	};
}

function createSecretMissionDefinition(
	seed: SecretMissionSeed,
): SecretMissionDefinition {
	return {
		code: seed.code,
		name: seed.name,
		group: seed.group,
		groupLabel: MISSION_GROUP_LABELS[seed.group],
		sortOrder: seed.sortOrder,
		secretIndex: seed.secretIndex,
		screenshotCandidates: getMissionScreenshotCandidates(seed.code),
	};
}

const primaryType = MISSION_TYPE_PRIMARY;
const encoreType = MISSION_TYPE_ENCORE;
const primeType = MISSION_TYPE_PRIME;

const preludeGroup = MISSION_GROUP_PRELUDE;
const act1Group = MISSION_GROUP_ACT_1;
const act2Group = MISSION_GROUP_ACT_2;
const act3Group = MISSION_GROUP_ACT_3;
const encoreGroup = MISSION_GROUP_ENCORE;
const primeGroup = MISSION_GROUP_PRIME;

const KNOWN_MISSION_REGISTRY: Record<
	number,
	Omit<UltrakillMissionDefinition, 'isKnown'>
> = {
	1: createKnownMissionDefinition({
		id: 1,
		code: '0-1',
		name: 'INTO THE FIRE',
		type: primaryType,
		group: preludeGroup,
		sortOrder: 1,
	}),
	2: createKnownMissionDefinition({
		id: 2,
		code: '0-2',
		name: 'THE MEATGRINDER',
		type: primaryType,
		group: preludeGroup,
		sortOrder: 2,
	}),
	3: createKnownMissionDefinition({
		id: 3,
		code: '0-3',
		name: 'DOUBLE DOWN',
		type: primaryType,
		group: preludeGroup,
		sortOrder: 3,
	}),
	4: createKnownMissionDefinition({
		id: 4,
		code: '0-4',
		name: 'A ONE-MACHINE ARMY',
		type: primaryType,
		group: preludeGroup,
		sortOrder: 4,
	}),
	5: createKnownMissionDefinition({
		id: 5,
		code: '0-5',
		name: 'CERBERUS',
		type: primaryType,
		group: preludeGroup,
		sortOrder: 5,
	}),

	6: createKnownMissionDefinition({
		id: 6,
		code: '1-1',
		name: 'HEART OF THE SUNRISE',
		type: primaryType,
		group: act1Group,
		sortOrder: 101,
	}),
	7: createKnownMissionDefinition({
		id: 7,
		code: '1-2',
		name: 'THE BURNING WORLD',
		type: primaryType,
		group: act1Group,
		sortOrder: 102,
	}),
	8: createKnownMissionDefinition({
		id: 8,
		code: '1-3',
		name: 'HALLS OF SACRED REMAINS',
		type: primaryType,
		group: act1Group,
		sortOrder: 103,
	}),
	9: createKnownMissionDefinition({
		id: 9,
		code: '1-4',
		name: 'CLAIR DE LUNE',
		type: primaryType,
		group: act1Group,
		sortOrder: 104,
	}),
	10: createKnownMissionDefinition({
		id: 10,
		code: '2-1',
		name: 'BRIDGEBURNER',
		type: primaryType,
		group: act1Group,
		sortOrder: 105,
	}),
	11: createKnownMissionDefinition({
		id: 11,
		code: '2-2',
		name: 'DEATH AT 20,000 VOLTS',
		type: primaryType,
		group: act1Group,
		sortOrder: 106,
	}),
	12: createKnownMissionDefinition({
		id: 12,
		code: '2-3',
		name: 'SHEER HEART ATTACK',
		type: primaryType,
		group: act1Group,
		sortOrder: 107,
	}),
	13: createKnownMissionDefinition({
		id: 13,
		code: '2-4',
		name: 'COURT OF THE CORPSE KING',
		type: primaryType,
		group: act1Group,
		sortOrder: 108,
	}),
	14: createKnownMissionDefinition({
		id: 14,
		code: '3-1',
		name: 'BELLY OF THE BEAST',
		type: primaryType,
		group: act1Group,
		sortOrder: 109,
	}),
	15: createKnownMissionDefinition({
		id: 15,
		code: '3-2',
		name: 'IN THE FLESH',
		type: primaryType,
		group: act1Group,
		sortOrder: 110,
	}),

	16: createKnownMissionDefinition({
		id: 16,
		code: '4-1',
		name: 'SLAVES TO POWER',
		type: primaryType,
		group: act2Group,
		sortOrder: 201,
	}),
	17: createKnownMissionDefinition({
		id: 17,
		code: '4-2',
		name: 'GOD DAMN THE SUN',
		type: primaryType,
		group: act2Group,
		sortOrder: 202,
	}),
	18: createKnownMissionDefinition({
		id: 18,
		code: '4-3',
		name: 'A SHOT IN THE DARK',
		type: primaryType,
		group: act2Group,
		sortOrder: 203,
	}),
	19: createKnownMissionDefinition({
		id: 19,
		code: '4-4',
		name: 'CLAIR DE SOLEIL',
		type: primaryType,
		group: act2Group,
		sortOrder: 204,
	}),
	20: createKnownMissionDefinition({
		id: 20,
		code: '5-1',
		name: 'IN THE WAKE OF POSEIDON',
		type: primaryType,
		group: act2Group,
		sortOrder: 205,
	}),
	21: createKnownMissionDefinition({
		id: 21,
		code: '5-2',
		name: 'WAVES OF THE STARLESS SEA',
		type: primaryType,
		group: act2Group,
		sortOrder: 206,
	}),
	22: createKnownMissionDefinition({
		id: 22,
		code: '5-3',
		name: 'SHIP OF FOOLS',
		type: primaryType,
		group: act2Group,
		sortOrder: 207,
	}),
	23: createKnownMissionDefinition({
		id: 23,
		code: '5-4',
		name: 'LEVIATHAN',
		type: primaryType,
		group: act2Group,
		sortOrder: 208,
	}),
	24: createKnownMissionDefinition({
		id: 24,
		code: '6-1',
		name: 'CRY FOR THE WEEPER',
		type: primaryType,
		group: act2Group,
		sortOrder: 209,
	}),
	25: createKnownMissionDefinition({
		id: 25,
		code: '6-2',
		name: 'AESTHETICS OF HATE',
		type: primaryType,
		group: act2Group,
		sortOrder: 210,
	}),

	26: createKnownMissionDefinition({
		id: 26,
		code: '7-1',
		name: 'GARDEN OF FORKING PATHS',
		type: primaryType,
		group: act3Group,
		sortOrder: 301,
	}),
	27: createKnownMissionDefinition({
		id: 27,
		code: '7-2',
		name: 'LIGHT UP THE NIGHT',
		type: primaryType,
		group: act3Group,
		sortOrder: 302,
	}),
	28: createKnownMissionDefinition({
		id: 28,
		code: '7-3',
		name: 'NO SOUND, NO MEMORY',
		type: primaryType,
		group: act3Group,
		sortOrder: 303,
	}),
	29: createKnownMissionDefinition({
		id: 29,
		code: '7-4',
		name: '...LIKE ANTENNAS TO HEAVEN',
		type: primaryType,
		group: act3Group,
		sortOrder: 304,
	}),
	30: createKnownMissionDefinition({
		id: 30,
		code: '8-1',
		name: 'HURTBREAK WONDERLAND',
		type: primaryType,
		group: act3Group,
		sortOrder: 305,
	}),
	31: createKnownMissionDefinition({
		id: 31,
		code: '8-2',
		name: 'THROUGH THE MIRROR',
		type: primaryType,
		group: act3Group,
		sortOrder: 306,
	}),
	32: createKnownMissionDefinition({
		id: 32,
		code: '8-3',
		name: 'DISINTEGRATION LOOP',
		type: primaryType,
		group: act3Group,
		sortOrder: 307,
	}),
	33: createKnownMissionDefinition({
		id: 33,
		code: '8-4',
		name: 'FINAL FLIGHT',
		type: primaryType,
		group: act3Group,
		sortOrder: 308,
	}),

	100: createKnownMissionDefinition({
		id: 100,
		code: '0-E',
		name: 'THIS HEAT, AN EVIL HEAT',
		type: encoreType,
		group: encoreGroup,
		sortOrder: 401,
	}),
	101: createKnownMissionDefinition({
		id: 101,
		code: '1-E',
		name: '...THEN FELL THE ASHES',
		type: encoreType,
		group: encoreGroup,
		sortOrder: 402,
	}),

	666: createKnownMissionDefinition({
		id: 666,
		code: 'P-1',
		name: 'SOUL SURVIVOR',
		type: primeType,
		group: primeGroup,
		sortOrder: 501,
	}),
	667: createKnownMissionDefinition({
		id: 667,
		code: 'P-2',
		name: 'WAIT OF THE WORLD',
		type: primeType,
		group: primeGroup,
		sortOrder: 502,
	}),
};

const SECRET_MISSION_DEFINITIONS: SecretMissionDefinition[] = [
	createSecretMissionDefinition({
		code: '0-S',
		name: 'SOMETHING WICKED',
		group: preludeGroup,
		sortOrder: 50,
		secretIndex: 0,
	}),
	createSecretMissionDefinition({
		code: '1-S',
		name: 'THE WITLESS',
		group: act1Group,
		sortOrder: 150,
		secretIndex: 1,
	}),
	createSecretMissionDefinition({
		code: '2-S',
		name: 'ALL-IMPERFECT LOVE SONG',
		group: act1Group,
		sortOrder: 250,
		secretIndex: 2,
	}),
	createSecretMissionDefinition({
		code: '4-S',
		name: 'CLASH OF THE BRANDICOOT',
		group: act2Group,
		sortOrder: 450,
		secretIndex: 4,
	}),
	createSecretMissionDefinition({
		code: '5-S',
		name: 'I ONLY SAY MORNING',
		group: act2Group,
		sortOrder: 550,
		secretIndex: 5,
	}),
	createSecretMissionDefinition({
		code: '7-S',
		name: 'HELL BATH NO FURY',
		group: act3Group,
		sortOrder: 750,
		secretIndex: 7,
	}),
	createSecretMissionDefinition({
		code: '8-S',
		name: '???',
		group: act3Group,
		sortOrder: 850,
		secretIndex: 8,
	}),
];

function createUnknownMissionDefinition(
	id: number,
): UltrakillMissionDefinition {
	return {
		id,
		code: `UNKNOWN-${id}`,
		name: '???',
		type: MISSION_TYPE_UNKNOWN,
		group: MISSION_GROUP_UNKNOWN,
		groupLabel: MISSION_GROUP_LABELS[MISSION_GROUP_UNKNOWN],
		sortOrder: 10000 + id,
		fileName: `lvl${id}progress.bepis`,
		screenshotCandidates: [],
		isKnown: false,
	};
}

function toKnownMissionDefinition(
	mission: Omit<UltrakillMissionDefinition, 'isKnown'>,
): UltrakillMissionDefinition {
	return {
		...mission,
		isKnown: true,
	};
}

export function getMissionById(id: number): UltrakillMissionDefinition {
	const known = KNOWN_MISSION_REGISTRY[id];

	if (known) {
		return toKnownMissionDefinition(known);
	}

	return createUnknownMissionDefinition(id);
}

export function getMissionByFileName(
	fileName: string,
): UltrakillMissionDefinition | null {
	const match = /^lvl(\d+)progress\.bepis$/i.exec(fileName);

	if (!match) {
		return null;
	}

	return getMissionById(Number(match[1]));
}

export function getFileNameForMission(id: number): string {
	return getMissionById(id).fileName;
}

export function getKnownPrimaryMissions(): UltrakillMissionDefinition[] {
	return Object.values(KNOWN_MISSION_REGISTRY)
		.filter((mission) => mission.type === MISSION_TYPE_PRIMARY)
		.map(toKnownMissionDefinition)
		.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getKnownEncoreMissions(): UltrakillMissionDefinition[] {
	return Object.values(KNOWN_MISSION_REGISTRY)
		.filter((mission) => mission.type === MISSION_TYPE_ENCORE)
		.map(toKnownMissionDefinition)
		.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getKnownPrimeMissions(): UltrakillMissionDefinition[] {
	return Object.values(KNOWN_MISSION_REGISTRY)
		.filter((mission) => mission.type === MISSION_TYPE_PRIME)
		.map(toKnownMissionDefinition)
		.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getKnownSecretMissions(): SecretMissionDefinition[] {
	return [...SECRET_MISSION_DEFINITIONS].sort(
		(a, b) => a.sortOrder - b.sortOrder,
	);
}

export function getAllKnownMissions(): UltrakillMissionDefinition[] {
	return Object.values(KNOWN_MISSION_REGISTRY)
		.map(toKnownMissionDefinition)
		.sort((a, b) => a.sortOrder - b.sortOrder);
}
