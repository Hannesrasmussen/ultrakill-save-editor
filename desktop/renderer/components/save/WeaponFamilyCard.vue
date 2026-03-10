<script setup lang="ts">
import { computed, ref } from "vue";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
} from "@/components";

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

const props = defineProps<{
  family: WeaponFamilyEntry;
  noJargon?: boolean;
}>();

const emit = defineEmits<{
  "update:item-enabled": [{ saveField: string; value: boolean }];
  "update:item-equipped": [{ prefKey: string; value: boolean }];
  "update:item-alt": [{ prefKey: string; value: boolean }];
  "update:customization-unlocked": [{ saveField: string; value: boolean }];
}>();
const failedIconItemIds = ref<Set<string>>(new Set());
const isWeaponFamily = computed(() => props.family.type === "weapon");
const baseVariantItems = computed(() =>
  props.family.items.filter((item) => !item.isAlternate),
);
const alternateItems = computed(() =>
  props.family.items.filter((item) => item.isAlternate),
);
const baseUnlocked = computed(() =>
  baseVariantItems.value.some((item) => item.enabled),
);
const alternateUnlocked = computed(() =>
  alternateItems.value.some((item) => item.enabled),
);
const displayItems = computed(() =>
  isWeaponFamily.value ? baseVariantItems.value : props.family.items,
);

function onCustomizationToggle(value: boolean) {
  if (!props.family.customizationField) {
    return;
  }

  emit("update:customization-unlocked", {
    saveField: props.family.customizationField,
    value,
  });
}

function onItemToggle(saveField: string, value: boolean) {
  emit("update:item-enabled", {
    saveField,
    value,
  });
}

function onBaseUnlockToggle(value: boolean) {
  for (const item of baseVariantItems.value) {
    onItemToggle(item.saveField, value);

    if (
      !value &&
      item.equipped === true &&
      item.altSelected !== true &&
      item.equippedPrefKey
    ) {
      onItemEquippedToggle(item.equippedPrefKey, false);
    }
  }
}

function onAlternateUnlockToggle(value: boolean) {
  for (const item of alternateItems.value) {
    onItemToggle(item.saveField, value);
  }

  if (!value) {
    for (const item of baseVariantItems.value) {
      if (
        item.supportsAlt &&
        item.equipped === true &&
        item.altSelected === true &&
        item.equippedPrefKey
      ) {
        onItemEquippedToggle(item.equippedPrefKey, false);
      }
    }
  }
}

function onItemEquippedToggle(prefKey: string | undefined, value: boolean) {
  if (!prefKey) {
    return;
  }

  emit("update:item-equipped", {
    prefKey,
    value,
  });
}

function onItemEquippedChanged(
  item: WeaponItemEntry,
  checked: boolean | "indeterminate",
) {
  const value = checked === true;
  if (!item.equippedPrefKey) {
    return;
  }

  if (value) {
    if (item.supportsAlt && item.altSelected && item.altUnlockSaveField) {
      if (item.altUnlocked !== true) {
        onItemToggle(item.altUnlockSaveField, true);
      }
    } else if (item.enabled !== true) {
      onItemToggle(item.saveField, true);
    }
  }

  onItemEquippedToggle(item.equippedPrefKey, value);
}

function onItemAltChanged(
  item: WeaponItemEntry,
  checked: boolean | "indeterminate",
) {
  const value = checked === true;
  if (!item.equippedPrefKey || !item.supportsAlt) {
    return;
  }

  emit("update:item-alt", {
    prefKey: item.equippedPrefKey,
    value,
  });

  if (item.equipped !== true) {
    return;
  }

  if (value && item.altUnlockSaveField && item.altUnlocked !== true) {
    onItemToggle(item.altUnlockSaveField, true);
  }

  if (!value && item.enabled !== true) {
    onItemToggle(item.saveField, true);
  }
}

function onItemIconError(itemId: string) {
  const next = new Set(failedIconItemIds.value);
  next.add(itemId);
  failedIconItemIds.value = next;
}

function getUnlockStateLabel(unlocked: boolean | null) {
  return unlocked === true ? "Unlocked" : "Locked";
}
</script>

<template>
  <Card class="max-w-140 min-w-150 h-fit">
    <CardHeader>
      <CardTitle>{{ props.family.displayName }}</CardTitle>
      <CardDescription>
        {{
          props.noJargon
            ? "Unlock weapon versions and choose which version you use."
            : "Unlocked: generalprogress.bepis | Equipped: Preferences/Prefs.json"
        }}
      </CardDescription>
    </CardHeader>

    <CardContent class="space-y-3">
      <div
        v-if="isWeaponFamily"
        class="space-y-2 rounded-md border border-primary/30 bg-primary/5 p-3"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-medium">
              {{ props.noJargon ? "Standard versions unlocked" : "Weapon unlocked" }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{
                props.noJargon
                  ? "Applies to all standard variants."
                  : "Applies to all standard variants in this family."
              }}
            </p>
          </div>
          <Checkbox
            :model-value="baseUnlocked"
            @update:model-value="onBaseUnlockToggle($event === true)"
          />
        </div>

        <div
          v-if="alternateItems.length"
          class="flex items-center justify-between gap-4"
        >
          <div>
            <p class="text-sm font-medium">
              {{ props.noJargon ? "Alternate versions unlocked" : "Alternate unlocked" }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{
                props.noJargon
                  ? "Applies to alternate versions."
                  : "Applies to alternate version(s) in this family."
              }}
            </p>
          </div>
          <Checkbox
            :model-value="alternateUnlocked"
            @update:model-value="onAlternateUnlockToggle($event === true)"
          />
        </div>
      </div>

      <div
        v-if="props.family.customizationUnlocked !== null"
        class="flex items-center justify-between rounded-md border p-3"
      >
        <div>
          <p class="font-medium">
            {{ props.noJargon ? "Weapon skins unlocked" : "Customization unlocked" }}
          </p>
          <p v-if="!props.noJargon" class="text-sm text-muted-foreground">
            Confirmed save flag: {{ props.family.customizationField }}
          </p>
        </div>

        <Checkbox
          :model-value="Boolean(props.family.customizationUnlocked)"
          @update:model-value="onCustomizationToggle($event === true)"
        />
      </div>

      <div
        v-for="item in displayItems"
        :key="item.id"
        class="rounded-md border p-3"
      >
        <div class="flex items-center justify-between gap-4">
          <div class="flex min-w-0 items-center gap-3">
            <div
              class="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/20"
            >
              <img
                v-if="item.iconPath && !failedIconItemIds.has(item.id)"
                :src="item.iconPath"
                :alt="`${item.variantName} icon`"
                class="h-full w-full object-contain p-1"
                @error="onItemIconError(item.id)"
              />
              <span v-else class="text-[10px] text-muted-foreground">
                No icon
              </span>
            </div>

            <div class="min-w-0">
              <p class="font-medium">{{ item.variantName }}</p>
              <p v-if="!props.noJargon" class="text-sm text-muted-foreground">
                {{ item.saveField }}
              </p>

              <div class="mt-1 flex gap-2">
                <Badge v-if="item.isAlternate" variant="outline">
                  Alternate
                </Badge>

                <Badge v-if="!props.noJargon" variant="secondary">
                  Slot: {{ item.color }}
                </Badge>
              </div>
            </div>
          </div>

          <div class="flex shrink-0 flex-col items-end gap-2">
            <div
              class="flex items-center gap-2 text-xs"
              :class="item.equipped === null ? 'opacity-60' : ''"
            >
              <Checkbox
                :model-value="Boolean(item.equipped)"
                :disabled="item.equipped === null"
                @update:model-value="onItemEquippedChanged(item, $event)"
              />
              <span>{{ props.noJargon ? "Use this" : "Equipped" }}</span>
            </div>

            <div
              v-if="item.supportsAlt"
              class="flex items-center gap-2 text-xs"
              :class="item.equipped !== true ? 'opacity-60' : ''"
            >
              <Checkbox
                :model-value="Boolean(item.altSelected)"
                :disabled="item.equipped !== true"
                @update:model-value="onItemAltChanged(item, $event)"
              />
              <span>{{ props.noJargon ? "Use alternate" : "Alt" }}</span>
            </div>

            <div class="text-[11px] text-muted-foreground text-right">
              <template v-if="item.supportsAlt">
                <div>
                  Standard: {{ getUnlockStateLabel(item.enabled) }}
                  <span v-if="!props.noJargon" class="font-mono">
                    ({{ item.saveField }})
                  </span>
                </div>
                <div>
                  Alternate: {{ getUnlockStateLabel(item.altUnlocked) }}
                  <span v-if="!props.noJargon" class="font-mono">
                    ({{ item.altUnlockSaveField }})
                  </span>
                </div>
              </template>
              <template v-else>
                {{ getUnlockStateLabel(item.enabled) }}
                <span v-if="!props.noJargon" class="font-mono">
                  ({{ item.saveField }})
                </span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
