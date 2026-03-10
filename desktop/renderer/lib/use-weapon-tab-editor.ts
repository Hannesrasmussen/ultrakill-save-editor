import { computed, ref, watch } from "vue";
import { loadedSave } from "@/lib/app-state";
import {
  EXTRA_WEAPON_FIELDS,
  getAllWeaponFamilies,
  getWeaponIconPath,
} from "@/lib/weapon-registry";

type GeneralProgress = Record<string, unknown>;
type PreferencesData = Record<string, unknown>;

const HIDDEN_WEAPON_EXTRA_FIELDS = new Set(["beam0", "beam1", "beam2", "beam3"]);

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toStoredBooleanFlag(existingValue: unknown, value: boolean) {
  return typeof existingValue === "boolean" ? value : Number(value);
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

function toAltFlag(value: unknown): boolean {
  if (typeof value === "number") {
    return value === 2;
  }

  if (typeof value === "string") {
    return value === "2";
  }

  return false;
}

function toPreferenceNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }

    return value.toLowerCase() === "true" ? 1 : 0;
  }

  return 0;
}

export function useWeaponTabEditor() {
  const preferencesData = ref<PreferencesData | null>(null);
  const preferencesLoadToken = ref(0);

  const weaponFamilies = getAllWeaponFamilies();

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

  const weaponFamilyEntries = computed(() => {
    const general = generalProgress.value;
    const prefs = preferencesData.value;

    if (!general) {
      return [];
    }

    return weaponFamilies.map((family) => {
      const alternateUnlockField = family.items.find(
        (entry) => entry.isAlternate,
      )?.saveField;

      return {
        ...family,
        customizationUnlocked: family.customizationField
          ? toBooleanFlag(general[family.customizationField])
          : null,
        items: family.items.map((item) => {
          const equippedPrefKey = PREFERENCES_KEY_BY_SAVE_FIELD[item.saveField];
          const prefValue =
            equippedPrefKey && prefs ? prefs[equippedPrefKey] : undefined;
          const supportsAlt =
            family.type === "weapon" &&
            !item.isAlternate &&
            Boolean(alternateUnlockField);

          return {
            ...item,
            enabled: toBooleanFlag(general[item.saveField]),
            equipped: equippedPrefKey && prefs ? toEquippedFlag(prefValue) : null,
            altSelected:
              equippedPrefKey && prefs && supportsAlt
                ? toAltFlag(prefValue)
                : null,
            supportsAlt,
            altUnlockSaveField: supportsAlt ? alternateUnlockField : undefined,
            altUnlocked:
              supportsAlt && alternateUnlockField
                ? toBooleanFlag(general[alternateUnlockField])
                : null,
            equippedPrefKey: equippedPrefKey ?? undefined,
            iconPath:
              getWeaponIconPath(
                item.saveField,
                equippedPrefKey && supportsAlt && prefs ? toAltFlag(prefValue) : false,
              ) ?? undefined,
          };
        }),
      };
    });
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
    const nextValue = toStoredBooleanFlag(existingValue, value);

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

  function updatePoints(value: number) {
    const currentSave = loadedSave.value;
    if (!currentSave) {
      return;
    }

    const currentGeneral = currentSave.other["generalprogress.bepis"];
    if (!isRecord(currentGeneral)) {
      return;
    }

    loadedSave.value = {
      ...currentSave,
      other: {
        ...currentSave.other,
        "generalprogress.bepis": {
          ...currentGeneral,
          money: value,
        },
      },
    };
  }

  async function writePreferences(
    slotDirectory: string,
    currentPrefs: PreferencesData,
    nextPrefs: PreferencesData,
  ) {
    preferencesData.value = nextPrefs;

    try {
      await window.api.writePreferences(slotDirectory, nextPrefs);
    } catch (error) {
      console.error(error);
      preferencesData.value = currentPrefs;
    }
  }

  async function updateEquippedWeapon(prefKey: string, value: boolean) {
    const save = loadedSave.value;
    const currentPrefs = preferencesData.value ?? {};

    if (!save?.directory) {
      return;
    }

    const currentValue = currentPrefs[prefKey];
    const altSelected = toAltFlag(currentValue);
    const nextNumeric = value ? (altSelected ? 2 : 1) : 0;

    const nextPrefs: PreferencesData = {
      ...currentPrefs,
      [prefKey]: nextNumeric,
    };

    await writePreferences(save.directory, currentPrefs, nextPrefs);
  }

  async function updateWeaponAlt(prefKey: string, value: boolean) {
    const save = loadedSave.value;
    const currentPrefs = preferencesData.value ?? {};

    if (!save?.directory) {
      return;
    }

    const currentValue = currentPrefs[prefKey];
    const currentNumeric = toPreferenceNumber(currentValue);
    const currentlyEquipped = currentNumeric > 0;
    const nextNumeric = value ? 2 : currentlyEquipped ? 1 : 0;

    const nextPrefs: PreferencesData = {
      ...currentPrefs,
      [prefKey]: nextNumeric,
    };

    await writePreferences(save.directory, currentPrefs, nextPrefs);
  }

  function unlockEverything() {
    const currentSave = loadedSave.value;
    if (!currentSave) {
      return;
    }

    const currentGeneral = currentSave.other["generalprogress.bepis"];
    if (!isRecord(currentGeneral)) {
      return;
    }

    const nextGeneral: Record<string, unknown> = { ...currentGeneral };

    for (const family of weaponFamilies) {
      for (const item of family.items) {
        nextGeneral[item.saveField] = toStoredBooleanFlag(
          currentGeneral[item.saveField],
          true,
        );
      }

      if (family.customizationField) {
        nextGeneral[family.customizationField] = toStoredBooleanFlag(
          currentGeneral[family.customizationField],
          true,
        );
      }
    }

    loadedSave.value = {
      ...currentSave,
      other: {
        ...currentSave.other,
        "generalprogress.bepis": nextGeneral,
      },
    };
  }

  async function equipEverything() {
    const save = loadedSave.value;
    const currentPrefs = preferencesData.value ?? {};

    if (!save?.directory) {
      return;
    }

    const currentGeneral = save.other["generalprogress.bepis"];
    if (!isRecord(currentGeneral)) {
      return;
    }

    const nextGeneral: Record<string, unknown> = { ...currentGeneral };
    const nextPrefs: PreferencesData = { ...currentPrefs };

    for (const family of weaponFamilies) {
      const alternateUnlockField = family.items.find(
        (entry) => entry.isAlternate,
      )?.saveField;

      for (const item of family.items) {
        if (item.isAlternate) {
          continue;
        }

        const prefKey = PREFERENCES_KEY_BY_SAVE_FIELD[item.saveField];
        if (!prefKey) {
          continue;
        }

        const supportsAlt =
          family.type === "weapon" && Boolean(alternateUnlockField);
        const altSelected = supportsAlt ? toAltFlag(currentPrefs[prefKey]) : false;

        if (altSelected && alternateUnlockField) {
          nextGeneral[alternateUnlockField] = toStoredBooleanFlag(
            currentGeneral[alternateUnlockField],
            true,
          );
          nextPrefs[prefKey] = 2;
        } else {
          nextGeneral[item.saveField] = toStoredBooleanFlag(
            currentGeneral[item.saveField],
            true,
          );
          nextPrefs[prefKey] = 1;
        }
      }
    }

    loadedSave.value = {
      ...save,
      other: {
        ...save.other,
        "generalprogress.bepis": nextGeneral,
      },
    };

    await writePreferences(save.directory, currentPrefs, nextPrefs);
  }

  function onWeaponFlagUpdate(payload: { saveField: string; value: boolean }) {
    updateGeneralProgressBooleanFlag(payload.saveField, payload.value);
  }

  function onPointsUpdated(value: number) {
    updatePoints(value);
  }

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

  return {
    points,
    weaponFamilyEntries,
    extraWeaponEntries,
    onWeaponFlagUpdate,
    onPointsUpdated,
    updateEquippedWeapon,
    updateWeaponAlt,
    unlockEverything,
    equipEverything,
  };
}
