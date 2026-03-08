<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { loadedSave, saveFolderPath } from "@/lib/app-state";
import { getAllDifficulties } from "@/lib/difficulty-registry";
import { useMissionEditor } from "@/lib/use-mission-editor";
import {
  EXTRA_WEAPON_FIELDS,
  getAllWeaponFamilies,
  getWeaponIconPath,
} from "@/lib/weapon-registry";

import { Badge } from "@/components";
import Sidebar from "@/components/layout/Sidebar.vue";
import SaveMissionsPanel from "@/components/save/SaveMissionsPanel.vue";
import SaveStatusPanel from "@/components/save/SaveStatusPanel.vue";
import SaveWeaponsPanel from "@/components/save/SaveWeaponsPanel.vue";

type MainSection = "missions" | "weapons";
type GeneralProgress = Record<string, unknown>;
type PreferencesData = Record<string, unknown>;
const HIDDEN_WEAPON_EXTRA_FIELDS = new Set([
  "beam0",
  "beam1",
  "beam2",
  "beam3",
]);
const PREFERENCES_KEY_BY_SAVE_FIELD: Record<string, string> = {
  rev0: "weapon.rev0",
  rev1: "weapon.rev1",
  rev2: "weapon.rev2",
  sho0: "weapon.sho0",
  sho1: "weapon.sho1",
  sho2: "weapon.sho2",
  nai0: "weapon.nai0",
  nai1: "weapon.nai1",
  nai2: "weapon.nai2",
  rai0: "weapon.rai0",
  rai1: "weapon.rai1",
  rai2: "weapon.rai2",
  rock0: "weapon.rock0",
  rock1: "weapon.rock1",
  rock2: "weapon.rock2",
  arm1: "weapon.arm0",
  arm2: "weapon.arm1",
  arm3: "weapon.arm2",
};

const activeSection = ref<MainSection>("missions");
const selectedDifficultyId = ref<number>(2);
const preferencesData = ref<PreferencesData | null>(null);
const preferencesLoadToken = ref(0);

const difficulties = getAllDifficulties();
const weaponFamilies = getAllWeaponFamilies();

const loadedSaveFolder = computed(
  () => saveFolderPath.value ?? "No Save folder loaded",
);

const selectedDifficultyName = computed(() => {
  return (
    difficulties.find(
      (difficulty) => difficulty.id === selectedDifficultyId.value,
    )?.name ?? "Unknown"
  );
});

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
} = useMissionEditor(selectedDifficultyId);

const generalProgress = computed(() => {
  if (!loadedSave.value) {
    return null;
  }

  return (loadedSave.value.other["generalprogress.bepis"] ??
    null) as GeneralProgress | null;
});

const points = computed(() => {
  const value = generalProgress.value?.money;
  return typeof value === "number" ? value : 0;
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toBooleanFlag(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value > 0;
  }

  if (typeof value === "string") {
    return value === "1" || value.toLowerCase() === "true";
  }

  return false;
}

function toEquippedFlag(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value > 0;
  }

  if (typeof value === "string") {
    return value === "1" || value.toLowerCase() === "true";
  }

  return false;
}

function updateGeneralProgressBooleanFlag(saveField: string, value: boolean) {
  const currentSave = loadedSave.value;
  if (!currentSave) {
    return;
  }

  const currentGeneral = currentSave.other["generalprogress.bepis"];
  if (!isRecord(currentGeneral)) {
    return;
  }

  const existingValue = currentGeneral[saveField];
  const nextValue = typeof existingValue === "boolean" ? value : Number(value);

  loadedSave.value = {
    ...currentSave,
    other: {
      ...currentSave.other,
      "generalprogress.bepis": {
        ...currentGeneral,
        [saveField]: nextValue,
      },
    },
  };
}

const weaponFamilyEntries = computed(() => {
  const general = generalProgress.value;
  const prefs = preferencesData.value;

  if (!general) {
    return [];
  }

  return weaponFamilies.map((family) => ({
    ...family,
    customizationUnlocked: family.customizationField
      ? toBooleanFlag(general[family.customizationField])
      : null,
    items: family.items.map((item) => {
      const equippedPrefKey = PREFERENCES_KEY_BY_SAVE_FIELD[item.saveField];

      return {
        ...item,
        enabled: toBooleanFlag(general[item.saveField]),
        equipped:
          equippedPrefKey && prefs
            ? toEquippedFlag(prefs[equippedPrefKey])
            : null,
        equippedPrefKey: equippedPrefKey ?? undefined,
        iconPath: getWeaponIconPath(item.saveField) ?? undefined,
      };
    }),
  }));
});

const extraWeaponEntries = computed(() => {
  const general = generalProgress.value;

  if (!general) {
    return [];
  }

  return EXTRA_WEAPON_FIELDS.map((field) => ({
    ...field,
    value: general[field.saveField] ?? 0,
  })).filter((field) => !HIDDEN_WEAPON_EXTRA_FIELDS.has(field.saveField));
});

watch(
  loadedSave,
  async (save) => {
    const token = ++preferencesLoadToken.value;

    if (!save?.directory) {
      preferencesData.value = null;
      return;
    }

    try {
      const response = await window.api.readPreferences(save.directory);
      if (token !== preferencesLoadToken.value) {
        return;
      }
      preferencesData.value = response.data ?? {};
    } catch (error) {
      if (token !== preferencesLoadToken.value) {
        return;
      }
      console.error(error);
      preferencesData.value = null;
    }
  },
  { immediate: true },
);

async function updateEquippedWeapon(prefKey: string, value: boolean) {
  const save = loadedSave.value;
  const currentPrefs = preferencesData.value ?? {};

  if (!save?.directory) {
    return;
  }

  const currentValue = currentPrefs[prefKey];
  const currentNumeric =
    typeof currentValue === "number"
      ? currentValue
      : currentValue === true
        ? 1
        : 0;
  const nextNumeric = value ? (currentNumeric > 0 ? currentNumeric : 1) : 0;

  const nextPrefs: PreferencesData = {
    ...currentPrefs,
    [prefKey]: nextNumeric,
  };

  preferencesData.value = nextPrefs;

  try {
    await window.api.writePreferences(save.directory, nextPrefs);
  } catch (error) {
    console.error(error);
    preferencesData.value = currentPrefs;
  }
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
              {{ activeSection === "missions" ? "Missions" : "Weapons" }}
            </h2>

            <p class="mt-1 text-sm text-muted-foreground">
              {{
                activeSection === "missions"
                  ? "Each difficulty has its own mission progress profile."
                  : "Manage weapon progression flags and customization unlock state."
              }}
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
        <SaveStatusPanel
          class="mb-6"
          :selected-difficulty-name="selectedDifficultyName"
        />

        <SaveMissionsPanel
          v-if="activeSection === 'missions'"
          :difficulties="difficulties"
          :selected-difficulty-id="selectedDifficultyId"
          :mission-entries="missionEntries"
          :secret-mission-entries="secretMissionEntries"
          @update:selected-difficulty-id="selectedDifficultyId = $event"
          @update:rank="
            (payload) => updateMissionRank(payload.fileName, payload.value)
          "
          @update:stat-rank="
            (payload) =>
              updateMissionStatRank(
                payload.fileName,
                payload.category,
                payload.rank,
              )
          "
          @update:challenge-completed="
            (payload) =>
              updateChallengeCompleted(payload.fileName, payload.value)
          "
          @update:major-assist="
            (payload) => updateMajorAssist(payload.fileName, payload.value)
          "
          @update:secret-found="
            (payload) =>
              updateSecretFound(payload.fileName, payload.index, payload.value)
          "
          @fill:secrets="(payload) => fillSecrets(payload.fileName)"
          @clear:secrets="(payload) => clearSecrets(payload.fileName)"
          @update:secret-mission-unlocked="
            (payload) =>
              updateSecretMissionUnlocked(payload.secretIndex, payload.value)
          "
          @update:secret-mission-completed="
            (payload) =>
              updateSecretMissionCompleted(payload.secretIndex, payload.value)
          "
          @quick-action:complete-all-missions="completeAllMissions"
          @quick-action:set-all-ranks="setAllMissionRanks($event)"
          @quick-action:set-all-secrets="setAllMissionSecrets($event)"
          @quick-action:set-all-challenges="setAllMissionChallenges($event)"
        />

        <SaveWeaponsPanel
          v-else
          :points="points"
          :weapon-family-entries="weaponFamilyEntries"
          :extra-weapon-entries="extraWeaponEntries"
          @update:weapon-flag="
            (payload) =>
              updateGeneralProgressBooleanFlag(payload.saveField, payload.value)
          "
          @update:item-equipped="
            (payload) => updateEquippedWeapon(payload.prefKey, payload.value)
          "
        />
      </div>
    </section>
  </div>
</template>
