<script setup lang="ts">
import SaveMissionsPanel from "@/components/save/SaveMissionsPanel.vue";
import SaveStatusPanel from "@/components/save/SaveStatusPanel.vue";
import type { DifficultyDefinition } from "@/lib/difficulty-registry";
import type {
  MissionEntry,
  SecretMissionEntry,
} from "@/lib/mission-editor-types";
import type {
  MissionStatCategory,
  MissionStatRankLabel,
} from "@/lib/mission-rank-requirements";
import type { QuickMissionRank } from "@/components/save/mission-panel-types";

const props = defineProps<{
  showSaveStatus: boolean;
  saveStatusExpanded: boolean;
  selectedDifficultyName: string;
  noJargon: boolean;
  difficulties: DifficultyDefinition[];
  selectedDifficultyId: number;
  missionEntries: MissionEntry[];
  secretMissionEntries: SecretMissionEntry[];
}>();

const emit = defineEmits<{
  "update:save-status-expanded": [value: boolean];
  "update:selected-difficulty-id": [value: number];
  "update:rank": [{ fileName: string; value: QuickMissionRank }];
  "update:stat-rank": [
    {
      fileName: string;
      category: MissionStatCategory;
      rank: MissionStatRankLabel;
    },
  ];
  "update:challenge-completed": [{ fileName: string; value: boolean }];
  "update:major-assist": [{ fileName: string; value: boolean }];
  "update:secret-found": [{ fileName: string; index: number; value: boolean }];
  "fill:secrets": [{ fileName: string }];
  "clear:secrets": [{ fileName: string }];
  "update:secret-mission-unlocked": [{ secretIndex: number; value: boolean }];
  "update:secret-mission-completed": [{ secretIndex: number; value: boolean }];
  "quick-action:complete-all-missions": [];
  "quick-action:set-all-ranks": [value: QuickMissionRank];
  "quick-action:set-all-secrets": [value: boolean];
  "quick-action:set-all-challenges": [value: boolean];
}>();
</script>

<template>
  <div class="space-y-6">
    <SaveStatusPanel
      v-if="props.showSaveStatus"
      :selected-difficulty-name="props.selectedDifficultyName"
      :no-jargon="props.noJargon"
      :expanded="props.saveStatusExpanded"
      @update:expanded="emit('update:save-status-expanded', $event)"
    />

    <SaveMissionsPanel
      :difficulties="props.difficulties"
      :selected-difficulty-id="props.selectedDifficultyId"
      :no-jargon="props.noJargon"
      :mission-entries="props.missionEntries"
      :secret-mission-entries="props.secretMissionEntries"
      @update:selected-difficulty-id="emit('update:selected-difficulty-id', $event)"
      @update:rank="emit('update:rank', $event)"
      @update:stat-rank="emit('update:stat-rank', $event)"
      @update:challenge-completed="emit('update:challenge-completed', $event)"
      @update:major-assist="emit('update:major-assist', $event)"
      @update:secret-found="emit('update:secret-found', $event)"
      @fill:secrets="emit('fill:secrets', $event)"
      @clear:secrets="emit('clear:secrets', $event)"
      @update:secret-mission-unlocked="
        emit('update:secret-mission-unlocked', $event)
      "
      @update:secret-mission-completed="
        emit('update:secret-mission-completed', $event)
      "
      @quick-action:complete-all-missions="
        emit('quick-action:complete-all-missions')
      "
      @quick-action:set-all-ranks="emit('quick-action:set-all-ranks', $event)"
      @quick-action:set-all-secrets="
        emit('quick-action:set-all-secrets', $event)
      "
      @quick-action:set-all-challenges="
        emit('quick-action:set-all-challenges', $event)
      "
    />
  </div>
</template>
