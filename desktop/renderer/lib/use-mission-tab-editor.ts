import type { Ref } from "vue";
import type { QuickMissionRank } from "@/components/save/mission-panel-types";
import type {
  MissionStatCategory,
  MissionStatRankLabel,
} from "@/lib/mission-rank-requirements";
import { useMissionEditor } from "@/lib/use-mission-editor";

export function useMissionTabEditor(options: {
  selectedDifficultyId: Ref<number>;
}) {
  const {
    missionEntries,
    secretMissionEntries,
    modifiedEntryCount,
    hasUnsavedMissionChanges,
    updateMissionRank,
    updateMissionStatRank,
    updateChallengeCompleted,
    updateMajorAssist,
    updateSecretFound,
    fillSecrets,
    clearSecrets,
    updateSecretMissionUnlocked,
    updateSecretMissionCompleted,
    completeAllMissions,
    setAllMissionRanks,
    setAllMissionSecrets,
    setAllMissionChallenges,
  } = useMissionEditor(options.selectedDifficultyId);

  function onMissionRankChanged(payload: {
    fileName: string;
    value: QuickMissionRank;
  }) {
    updateMissionRank(payload.fileName, payload.value);
  }

  function onMissionStatRankChanged(payload: {
    fileName: string;
    category: MissionStatCategory;
    rank: MissionStatRankLabel;
  }) {
    updateMissionStatRank(payload.fileName, payload.category, payload.rank);
  }

  function onMissionChallengeChanged(payload: {
    fileName: string;
    value: boolean;
  }) {
    updateChallengeCompleted(payload.fileName, payload.value);
  }

  function onMissionMajorAssistChanged(payload: {
    fileName: string;
    value: boolean;
  }) {
    updateMajorAssist(payload.fileName, payload.value);
  }

  function onMissionSecretChanged(payload: {
    fileName: string;
    index: number;
    value: boolean;
  }) {
    updateSecretFound(payload.fileName, payload.index, payload.value);
  }

  function onFillMissionSecrets(payload: { fileName: string }) {
    fillSecrets(payload.fileName);
  }

  function onClearMissionSecrets(payload: { fileName: string }) {
    clearSecrets(payload.fileName);
  }

  function onSecretMissionUnlockedChanged(payload: {
    secretIndex: number;
    value: boolean;
  }) {
    updateSecretMissionUnlocked(payload.secretIndex, payload.value);
  }

  function onSecretMissionCompletedChanged(payload: {
    secretIndex: number;
    value: boolean;
  }) {
    updateSecretMissionCompleted(payload.secretIndex, payload.value);
  }

  function onCompleteAllMissions() {
    completeAllMissions();
  }

  function onSetAllMissionRanks(rank: QuickMissionRank) {
    setAllMissionRanks(rank);
  }

  function onSetAllMissionSecrets(value: boolean) {
    setAllMissionSecrets(value);
  }

  function onSetAllMissionChallenges(value: boolean) {
    setAllMissionChallenges(value);
  }

  return {
    missionEntries,
    secretMissionEntries,
    modifiedEntryCount,
    hasUnsavedMissionChanges,
    onMissionRankChanged,
    onMissionStatRankChanged,
    onMissionChallengeChanged,
    onMissionMajorAssistChanged,
    onMissionSecretChanged,
    onFillMissionSecrets,
    onClearMissionSecrets,
    onSecretMissionUnlockedChanged,
    onSecretMissionCompletedChanged,
    onCompleteAllMissions,
    onSetAllMissionRanks,
    onSetAllMissionSecrets,
    onSetAllMissionChallenges,
  };
}
