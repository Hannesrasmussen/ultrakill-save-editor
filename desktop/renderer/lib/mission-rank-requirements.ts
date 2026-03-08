import type { MissionStat } from "@/lib/mission-editor-types";

export type MissionRankLabel = "D" | "C" | "B" | "A" | "S" | "P";
export type MissionStatRankLabel = "D" | "C" | "B" | "A" | "S";
export type MissionStatCategory = "time" | "kills" | "style";
export type MissionFinalRankLabel = "D" | "C" | "B" | "A" | "S" | "P";

export interface MissionRankThresholds {
  S: Required<MissionStat>;
  A: Required<MissionStat>;
  B: Required<MissionStat>;
  C: Required<MissionStat>;
}

// Source: Maintainer-provided ULTRAKILL Fraud update P-rank table (received 2026-03-08).
// Rule: P-rank uses S thresholds for time/kills/style.
const MISSION_RANK_THRESHOLDS: Record<string, MissionRankThresholds> = {
  "0-1": {
    S: {
      time: 150,
      kills: 71,
      style: 7000,
    },
    A: {
      time: 185,
      kills: 66,
      style: 5000,
    },
    B: {
      time: 300,
      kills: 55,
      style: 3000,
    },
    C: {
      time: 480,
      kills: 40,
      style: 1000,
    },
  },
  "0-2": {
    S: {
      time: 120,
      kills: 53,
      style: 6000,
    },
    A: {
      time: 180,
      kills: 50,
      style: 4250,
    },
    B: {
      time: 240,
      kills: 40,
      style: 3000,
    },
    C: {
      time: 300,
      kills: 20,
      style: 1750,
    },
  },
  "0-3": {
    S: {
      time: 210,
      kills: 49,
      style: 7000,
    },
    A: {
      time: 300,
      kills: 45,
      style: 5000,
    },
    B: {
      time: 600,
      kills: 25,
      style: 3000,
    },
    C: {
      time: 900,
      kills: 10,
      style: 1000,
    },
  },
  "0-4": {
    S: {
      time: 140,
      kills: 53,
      style: 8500,
    },
    A: {
      time: 180,
      kills: 50,
      style: 7500,
    },
    B: {
      time: 240,
      kills: 40,
      style: 5000,
    },
    C: {
      time: 300,
      kills: 30,
      style: 2000,
    },
  },
  "0-5": {
    S: {
      time: 120,
      kills: 2,
      style: 3200,
    },
    A: {
      time: 180,
      kills: 2,
      style: 2500,
    },
    B: {
      time: 300,
      kills: 1,
      style: 1250,
    },
    C: {
      time: 600,
      kills: 1,
      style: 500,
    },
  },
  "1-1": {
    S: {
      time: 270,
      kills: 76,
      style: 8000,
    },
    A: {
      time: 300,
      kills: 70,
      style: 7000,
    },
    B: {
      time: 360,
      kills: 60,
      style: 5000,
    },
    C: {
      time: 480,
      kills: 40,
      style: 2000,
    },
  },
  "1-2": {
    S: {
      time: 280,
      kills: 62,
      style: 7000,
    },
    A: {
      time: 300,
      kills: 55,
      style: 6000,
    },
    B: {
      time: 360,
      kills: 40,
      style: 4500,
    },
    C: {
      time: 500,
      kills: 30,
      style: 1500,
    },
  },
  "1-3": {
    S: {
      time: 480,
      kills: 125,
      style: 14000,
    },
    A: {
      time: 600,
      kills: 100,
      style: 10000,
    },
    B: {
      time: 720,
      kills: 61,
      style: 7500,
    },
    C: {
      time: 1080,
      kills: 40,
      style: 3000,
    },
  },
  "1-4": {
    S: {
      time: 135,
      kills: 0,
      style: 600,
    },
    A: {
      time: 180,
      kills: 0,
      style: 500,
    },
    B: {
      time: 240,
      kills: 0,
      style: 300,
    },
    C: {
      time: 300,
      kills: 0,
      style: 150,
    },
  },
  "2-1": {
    S: {
      time: 210,
      kills: 69,
      style: 11000,
    },
    A: {
      time: 240,
      kills: 60,
      style: 10000,
    },
    B: {
      time: 300,
      kills: 45,
      style: 7500,
    },
    C: {
      time: 480,
      kills: 20,
      style: 3500,
    },
  },
  "2-2": {
    S: {
      time: 300,
      kills: 62,
      style: 12000,
    },
    A: {
      time: 360,
      kills: 55,
      style: 10000,
    },
    B: {
      time: 480,
      kills: 40,
      style: 7500,
    },
    C: {
      time: 600,
      kills: 25,
      style: 5000,
    },
  },
  "2-3": {
    S: {
      time: 260,
      kills: 66,
      style: 9000,
    },
    A: {
      time: 300,
      kills: 63,
      style: 7500,
    },
    B: {
      time: 360,
      kills: 50,
      style: 5000,
    },
    C: {
      time: 480,
      kills: 25,
      style: 2500,
    },
  },
  "2-4": {
    S: {
      time: 240,
      kills: 1,
      style: 3500,
    },
    A: {
      time: 300,
      kills: 1,
      style: 2500,
    },
    B: {
      time: 360,
      kills: 1,
      style: 1500,
    },
    C: {
      time: 480,
      kills: 1,
      style: 750,
    },
  },
  "3-1": {
    S: {
      time: 330,
      kills: 88,
      style: 18000,
    },
    A: {
      time: 390,
      kills: 84,
      style: 15000,
    },
    B: {
      time: 480,
      kills: 75,
      style: 10000,
    },
    C: {
      time: 660,
      kills: 50,
      style: 5000,
    },
  },
  "3-2": {
    S: {
      time: 270,
      kills: 0,
      style: 2000,
    },
    A: {
      time: 320,
      kills: 0,
      style: 1500,
    },
    B: {
      time: 400,
      kills: 0,
      style: 1000,
    },
    C: {
      time: 600,
      kills: 0,
      style: 500,
    },
  },
  "4-1": {
    S: {
      time: 240,
      kills: 102,
      style: 18000,
    },
    A: {
      time: 270,
      kills: 95,
      style: 16000,
    },
    B: {
      time: 330,
      kills: 85,
      style: 12000,
    },
    C: {
      time: 480,
      kills: 50,
      style: 7500,
    },
  },
  "4-2": {
    S: {
      time: 280,
      kills: 69,
      style: 18000,
    },
    A: {
      time: 330,
      kills: 60,
      style: 16000,
    },
    B: {
      time: 420,
      kills: 50,
      style: 12000,
    },
    C: {
      time: 720,
      kills: 35,
      style: 7500,
    },
  },
  "4-3": {
    S: {
      time: 330,
      kills: 75,
      style: 17000,
    },
    A: {
      time: 360,
      kills: 71,
      style: 16000,
    },
    B: {
      time: 420,
      kills: 58,
      style: 12000,
    },
    C: {
      time: 600,
      kills: 40,
      style: 7500,
    },
  },
  "4-4": {
    S: {
      time: 165,
      kills: 4,
      style: 2500,
    },
    A: {
      time: 210,
      kills: 2,
      style: 1950,
    },
    B: {
      time: 260,
      kills: 1,
      style: 1200,
    },
    C: {
      time: 330,
      kills: 1,
      style: 500,
    },
  },
  "5-1": {
    S: {
      time: 360,
      kills: 67,
      style: 20000,
    },
    A: {
      time: 400,
      kills: 60,
      style: 17500,
    },
    B: {
      time: 480,
      kills: 50,
      style: 10000,
    },
    C: {
      time: 600,
      kills: 35,
      style: 4500,
    },
  },
  "5-2": {
    S: {
      time: 270,
      kills: 37,
      style: 10000,
    },
    A: {
      time: 300,
      kills: 33,
      style: 8500,
    },
    B: {
      time: 360,
      kills: 25,
      style: 6000,
    },
    C: {
      time: 500,
      kills: 15,
      style: 2500,
    },
  },
  "5-3": {
    S: {
      time: 480,
      kills: 120,
      style: 30000,
    },
    A: {
      time: 540,
      kills: 105,
      style: 27500,
    },
    B: {
      time: 660,
      kills: 85,
      style: 15000,
    },
    C: {
      time: 800,
      kills: 50,
      style: 7500,
    },
  },
  "5-4": {
    S: {
      time: 130,
      kills: 1,
      style: 5000,
    },
    A: {
      time: 160,
      kills: 0,
      style: 4000,
    },
    B: {
      time: 240,
      kills: 0,
      style: 2000,
    },
    C: {
      time: 420,
      kills: 0,
      style: 500,
    },
  },
  "6-1": {
    S: {
      time: 380,
      kills: 91,
      style: 27500,
    },
    A: {
      time: 420,
      kills: 87,
      style: 22500,
    },
    B: {
      time: 550,
      kills: 70,
      style: 12000,
    },
    C: {
      time: 790,
      kills: 40,
      style: 5000,
    },
  },
  "6-2": {
    S: {
      time: 110,
      kills: 0,
      style: 3000,
    },
    A: {
      time: 135,
      kills: 0,
      style: 2500,
    },
    B: {
      time: 240,
      kills: 0,
      style: 1500,
    },
    C: {
      time: 480,
      kills: 0,
      style: 750,
    },
  },
  "7-1": {
    S: {
      time: 400,
      kills: 51,
      style: 17000,
    },
    A: {
      time: 450,
      kills: 48,
      style: 15000,
    },
    B: {
      time: 600,
      kills: 40,
      style: 10000,
    },
    C: {
      time: 900,
      kills: 20,
      style: 5000,
    },
  },
  "7-2": {
    S: {
      time: 435,
      kills: 35,
      style: 18500,
    },
    A: {
      time: 500,
      kills: 32,
      style: 16000,
    },
    B: {
      time: 660,
      kills: 29,
      style: 12000,
    },
    C: {
      time: 1000,
      kills: 20,
      style: 7500,
    },
  },
  "7-3": {
    S: {
      time: 435,
      kills: 60,
      style: 13000,
    },
    A: {
      time: 500,
      kills: 56,
      style: 11000,
    },
    B: {
      time: 660,
      kills: 42,
      style: 7500,
    },
    C: {
      time: 1000,
      kills: 25,
      style: 3500,
    },
  },
  "7-4": {
    S: {
      time: 330,
      kills: 32,
      style: 16500,
    },
    A: {
      time: 360,
      kills: 28,
      style: 15000,
    },
    B: {
      time: 480,
      kills: 18,
      style: 9000,
    },
    C: {
      time: 760,
      kills: 6,
      style: 3500,
    },
  },
  "8-1": {
    S: {
      time: 480,
      kills: 80,
      style: 27500,
    },
    A: {
      time: 550,
      kills: 70,
      style: 22500,
    },
    B: {
      time: 720,
      kills: 50,
      style: 15000,
    },
    C: {
      time: 1050,
      kills: 25,
      style: 7500,
    },
  },
  "8-2": {
    S: {
      time: 540,
      kills: 91,
      style: 30000,
    },
    A: {
      time: 600,
      kills: 86,
      style: 25000,
    },
    B: {
      time: 690,
      kills: 68,
      style: 15000,
    },
    C: {
      time: 960,
      kills: 50,
      style: 7500,
    },
  },
  "8-3": {
    S: {
      time: 1050,
      kills: 197,
      style: 74000,
    },
    A: {
      time: 1110,
      kills: 186,
      style: 69000,
    },
    B: {
      time: 1200,
      kills: 155,
      style: 50000,
    },
    C: {
      time: 1600,
      kills: 100,
      style: 25000,
    },
  },
  "8-4": {
    S: {
      time: 160,
      kills: 7,
      style: 12000,
    },
    A: {
      time: 200,
      kills: 6,
      style: 10000,
    },
    B: {
      time: 300,
      kills: 5,
      style: 7500,
    },
    C: {
      time: 600,
      kills: 4,
      style: 3500,
    },
  },
  "0-E": {
    S: {
      time: 570,
      kills: 111,
      style: 48000,
    },
    A: {
      time: 600,
      kills: 105,
      style: 44000,
    },
    B: {
      time: 720,
      kills: 90,
      style: 35000,
    },
    C: {
      time: 900,
      kills: 75,
      style: 20000,
    },
  },
  "1-E": {
    S: {
      time: 460,
      kills: 61,
      style: 40000,
    },
    A: {
      time: 500,
      kills: 57,
      style: 37500,
    },
    B: {
      time: 600,
      kills: 45,
      style: 30000,
    },
    C: {
      time: 750,
      kills: 25,
      style: 20000,
    },
  },
  "P-1": {
    S: {
      time: 213,
      kills: 2,
      style: 7500,
    },
    A: {
      time: 240,
      kills: 1,
      style: 5000,
    },
    B: {
      time: 360,
      kills: 1,
      style: 2500,
    },
    C: {
      time: 600,
      kills: 1,
      style: 500,
    },
  },
  "P-2": {
    S: {
      time: 620,
      kills: 59,
      style: 36000,
    },
    A: {
      time: 680,
      kills: 55,
      style: 30000,
    },
    B: {
      time: 800,
      kills: 40,
      style: 20000,
    },
    C: {
      time: 1220,
      kills: 20,
      style: 7500,
    },
  },
};

export function hasMissionRankThresholds(
  code: string | null | undefined,
): boolean {
  if (!code) {
    return false;
  }

  return Boolean(MISSION_RANK_THRESHOLDS[code.toUpperCase()]);
}

const STAT_RANK_POINTS: Record<MissionStatRankLabel, number> = {
  D: 1,
  C: 2,
  B: 3,
  A: 4,
  S: 5,
};

function getDerivedDRankStats(
  thresholds: MissionRankThresholds,
): Required<MissionStat> {
  // D has no explicit published threshold on wiki pages. We set values just below C.
  return {
    time: thresholds.C.time + 1,
    kills: Math.max(0, thresholds.C.kills - 1),
    style: Math.max(0, thresholds.C.style - 1),
  };
}

export function getMissionStatsForRank(
  code: string | null | undefined,
  rank: MissionRankLabel,
): Required<MissionStat> | null {
  if (!code) {
    return null;
  }

  const thresholds = MISSION_RANK_THRESHOLDS[code.toUpperCase()];

  if (!thresholds) {
    return null;
  }

  if (rank === "P" || rank === "S") {
    return { ...thresholds.S };
  }

  if (rank === "A") {
    return { ...thresholds.A };
  }

  if (rank === "B") {
    return { ...thresholds.B };
  }

  if (rank === "C") {
    return { ...thresholds.C };
  }

  return getDerivedDRankStats(thresholds);
}

export function getMissionStatValueForRank(
  code: string | null | undefined,
  category: MissionStatCategory,
  rank: MissionStatRankLabel,
): number | null {
  const stats = getMissionStatsForRank(code, rank);

  if (!stats) {
    return null;
  }

  return stats[category];
}

export function getMissionStatRank(
  code: string | null | undefined,
  category: MissionStatCategory,
  value: number | null | undefined,
): MissionStatRankLabel | null {
  if (typeof value !== "number") {
    return null;
  }

  const s = getMissionStatsForRank(code, "S");
  const a = getMissionStatsForRank(code, "A");
  const b = getMissionStatsForRank(code, "B");
  const c = getMissionStatsForRank(code, "C");

  if (!s || !a || !b || !c) {
    return null;
  }

  if (category === "time") {
    if (value <= s.time) {
      return "S";
    }

    if (value <= a.time) {
      return "A";
    }

    if (value <= b.time) {
      return "B";
    }

    if (value <= c.time) {
      return "C";
    }

    return "D";
  }

  if (value >= s[category]) {
    return "S";
  }

  if (value >= a[category]) {
    return "A";
  }

  if (value >= b[category]) {
    return "B";
  }

  if (value >= c[category]) {
    return "C";
  }

  return "D";
}

export function getMissionRankFromStatRanks(statRanks: {
  time: MissionStatRankLabel;
  kills: MissionStatRankLabel;
  style: MissionStatRankLabel;
}, options?: {
  checkpointRestarts?: number | null | undefined;
  majorAssistsEnabled?: boolean | null | undefined;
  cheatsEnabled?: boolean | null | undefined;
}): MissionFinalRankLabel | null {
  if (options?.cheatsEnabled) {
    return null;
  }

  const restartPenalty = Math.max(
    0,
    Math.floor(Number(options?.checkpointRestarts ?? 0)),
  );

  const finalScore =
    STAT_RANK_POINTS[statRanks.time] +
    STAT_RANK_POINTS[statRanks.kills] +
    STAT_RANK_POINTS[statRanks.style] -
    restartPenalty;

  if (finalScore <= 4) {
    return "D";
  }

  if (finalScore <= 7) {
    return "C";
  }

  if (finalScore <= 10) {
    return "B";
  }

  if (finalScore <= 13) {
    return "A";
  }

  if (finalScore <= 14) {
    return "S";
  }

  if (options?.majorAssistsEnabled) {
    return "S";
  }

  if (finalScore >= 15) {
    return "P";
  }

  return "S";
}
