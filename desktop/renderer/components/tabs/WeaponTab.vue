<script setup lang="ts">
import SaveStatusPanel from "@/components/save/SaveStatusPanel.vue";
import SaveWeaponsPanel from "@/components/save/SaveWeaponsPanel.vue";

interface WeaponItemEntry {
  id: string;
  family: string;
  type: "weapon" | "arm";
  displayName: string;
  variantName: string;
  color: "blue" | "green" | "red" | "alternate" | "special";
  saveField: string;
  iconPath?: string;
  isAlternate?: boolean;
  enabled: boolean;
  equipped: boolean | null;
  altSelected: boolean | null;
  supportsAlt: boolean;
  altUnlockSaveField?: string;
  altUnlocked: boolean | null;
  equippedPrefKey?: string;
}

interface WeaponFamilyEntry {
  id: string;
  displayName: string;
  type: "weapon" | "arm";
  customizationField?: string;
  customizationUnlocked: boolean | null;
  items: WeaponItemEntry[];
}

interface ExtraWeaponEntry {
  id: string;
  displayName: string;
  saveField: string;
  value: unknown;
}

const props = defineProps<{
  showSaveStatus: boolean;
  saveStatusExpanded: boolean;
  selectedDifficultyName: string;
  noJargon: boolean;
  points: number;
  weaponFamilyEntries: WeaponFamilyEntry[];
  extraWeaponEntries: ExtraWeaponEntry[];
}>();

const emit = defineEmits<{
  "update:save-status-expanded": [value: boolean];
  "update:weapon-flag": [{ saveField: string; value: boolean }];
  "update:item-equipped": [{ prefKey: string; value: boolean }];
  "update:item-alt": [{ prefKey: string; value: boolean }];
  "update:points": [value: number];
  "quick-action:unlock-all": [];
  "quick-action:equip-all": [];
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

    <SaveWeaponsPanel
      :points="props.points"
      :no-jargon="props.noJargon"
      :weapon-family-entries="props.weaponFamilyEntries"
      :extra-weapon-entries="props.extraWeaponEntries"
      @update:points="emit('update:points', $event)"
      @update:weapon-flag="emit('update:weapon-flag', $event)"
      @update:item-equipped="emit('update:item-equipped', $event)"
      @update:item-alt="emit('update:item-alt', $event)"
      @quick-action:unlock-all="emit('quick-action:unlock-all')"
      @quick-action:equip-all="emit('quick-action:equip-all')"
    />
  </div>
</template>
