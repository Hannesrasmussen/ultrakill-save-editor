<script setup lang="ts">
import { computed, ref } from "vue";

import { saveFolderPath } from "@/lib/app-state";
import {
  ALL_DIFFICULTIES_ID,
  ALL_DIFFICULTIES_LABEL,
  getAllDifficulties,
} from "@/lib/difficulty-registry";
import { editorSettings } from "@/lib/editor-settings";
import {
  MAIN_SECTION_ITEMS,
  getMainSectionDescription,
  type MainSection,
} from "@/lib/main-sections";
import { useMissionTabEditor } from "@/lib/use-mission-tab-editor";
import { useWeaponTabEditor } from "@/lib/use-weapon-tab-editor";

import { Badge } from "@/components";
import Sidebar from "@/components/layout/Sidebar.vue";
import MissionTab from "@/components/tabs/MissionTab.vue";
import SettingsTab from "@/components/tabs/SettingsTab.vue";
import WeaponTab from "@/components/tabs/WeaponTab.vue";

const activeSection = ref<MainSection>("missions");
const saveStatusExpanded = ref(true);
const selectedDifficultyId = ref<number>(2);

const difficulties = getAllDifficulties();

const loadedSaveFolder = computed(
  () => saveFolderPath.value ?? "No Save folder loaded",
);

const selectedDifficultyName = computed(() => {
  if (selectedDifficultyId.value === ALL_DIFFICULTIES_ID) {
    return ALL_DIFFICULTIES_LABEL;
  }

  return (
    difficulties.find(
      (difficulty) => difficulty.id === selectedDifficultyId.value,
    )?.name ?? "Unknown"
  );
});

const sectionTitle = computed(() => {
  return (
    MAIN_SECTION_ITEMS.find((section) => section.id === activeSection.value)
      ?.title ?? "Editor"
  );
});

const sectionDescription = computed(() => {
  return getMainSectionDescription(
    activeSection.value,
    editorSettings.value.noJargon,
  );
});

const {
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
} = useMissionTabEditor({
  selectedDifficultyId,
});

const {
  points,
  weaponFamilyEntries,
  extraWeaponEntries,
  onWeaponFlagUpdate,
  onPointsUpdated,
  updateEquippedWeapon,
  updateWeaponAlt,
  unlockEverything,
  equipEverything,
} = useWeaponTabEditor();

function onWeaponEquippedChanged(payload: { prefKey: string; value: boolean }) {
  void updateEquippedWeapon(payload.prefKey, payload.value);
}

function onWeaponAltChanged(payload: { prefKey: string; value: boolean }) {
  void updateWeaponAlt(payload.prefKey, payload.value);
}

function onUnlockAllWeapons() {
  unlockEverything();
}

function onEquipAllWeapons() {
  void equipEverything();
}
</script>

<template>
  <div class="flex h-full bg-background text-foreground">
    <Sidebar
      :active-section="activeSection"
      :has-unsaved-changes="hasUnsavedMissionChanges"
      :modified-entry-count="modifiedEntryCount"
      :loaded-save-folder="loadedSaveFolder"
      @update:active-section="activeSection = $event"
    />

    <section class="flex min-w-0 flex-1 flex-col">
      <div class="border-b px-6 py-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-2xl font-semibold tracking-tight">
              {{ sectionTitle }}
            </h2>

            <p class="mt-1 text-sm text-muted-foreground">
              {{ sectionDescription }}
            </p>
          </div>

          <Badge
            v-if="activeSection === 'missions' && hasUnsavedMissionChanges"
            variant="secondary"
          >
            {{ modifiedEntryCount }} modified
          </Badge>
        </div>
      </div>

      <div class="flex-1 overflow-auto p-6">
        <MissionTab
          v-if="activeSection === 'missions'"
          :show-save-status="editorSettings.showSaveStatus"
          :save-status-expanded="saveStatusExpanded"
          :selected-difficulty-name="selectedDifficultyName"
          :no-jargon="editorSettings.noJargon"
          :difficulties="difficulties"
          :selected-difficulty-id="selectedDifficultyId"
          :mission-entries="missionEntries"
          :secret-mission-entries="secretMissionEntries"
          @update:save-status-expanded="saveStatusExpanded = $event"
          @update:selected-difficulty-id="selectedDifficultyId = $event"
          @update:rank="onMissionRankChanged"
          @update:stat-rank="onMissionStatRankChanged"
          @update:challenge-completed="onMissionChallengeChanged"
          @update:major-assist="onMissionMajorAssistChanged"
          @update:secret-found="onMissionSecretChanged"
          @fill:secrets="onFillMissionSecrets"
          @clear:secrets="onClearMissionSecrets"
          @update:secret-mission-unlocked="onSecretMissionUnlockedChanged"
          @update:secret-mission-completed="onSecretMissionCompletedChanged"
          @quick-action:complete-all-missions="onCompleteAllMissions"
          @quick-action:set-all-ranks="onSetAllMissionRanks"
          @quick-action:set-all-secrets="onSetAllMissionSecrets"
          @quick-action:set-all-challenges="onSetAllMissionChallenges"
        />

        <WeaponTab
          v-else-if="activeSection === 'weapons'"
          :show-save-status="editorSettings.showSaveStatus"
          :save-status-expanded="saveStatusExpanded"
          :selected-difficulty-name="selectedDifficultyName"
          :no-jargon="editorSettings.noJargon"
          :points="points"
          :weapon-family-entries="weaponFamilyEntries"
          :extra-weapon-entries="extraWeaponEntries"
          @update:save-status-expanded="saveStatusExpanded = $event"
          @update:points="onPointsUpdated"
          @update:weapon-flag="onWeaponFlagUpdate"
          @update:item-equipped="onWeaponEquippedChanged"
          @update:item-alt="onWeaponAltChanged"
          @quick-action:unlock-all="onUnlockAllWeapons"
          @quick-action:equip-all="onEquipAllWeapons"
        />

        <SettingsTab v-else />
      </div>
    </section>
  </div>
</template>
