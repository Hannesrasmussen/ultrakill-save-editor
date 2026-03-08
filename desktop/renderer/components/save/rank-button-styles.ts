import type { QuickMissionRank } from "@/components/save/mission-panel-types";
import type { MissionStatRankLabel } from "@/lib/mission-rank-requirements";

const RANK_TEXT_CLASS_BY_RANK: Record<QuickMissionRank | "S", string> = {
  D: "text-sky-300",
  C: "text-emerald-300",
  B: "text-yellow-300",
  A: "text-orange-300",
  S: "text-red-300",
  P: "text-amber-300",
};

export function getQuickRankButtonClass(rank: QuickMissionRank): string {
  return `font-semibold ${RANK_TEXT_CLASS_BY_RANK[rank]}`;
}

export function getStatRankButtonClass(
  rank: MissionStatRankLabel,
  selected: boolean,
): string {
  const textClass = RANK_TEXT_CLASS_BY_RANK[rank];

  if (selected) {
    return [
      "font-semibold ring-2 ring-white ring-offset-1 ring-offset-background",
      textClass,
    ].join(" ");
  }

  return `font-medium ${textClass}`;
}
