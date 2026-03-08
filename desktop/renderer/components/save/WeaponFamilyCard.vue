<script setup lang="ts">
import { computed, ref } from 'vue';
import {
	Badge,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Switch,
} from '@/components';

interface WeaponItemEntry {
	id: string;
	family: string;
	type: 'weapon' | 'arm';
	displayName: string;
	variantName: string;
	color: 'blue' | 'green' | 'red' | 'alternate' | 'special';
	saveField: string;
	iconPath?: string;
	isAlternate?: boolean;
	enabled: boolean;
	equipped: boolean | null;
	equippedPrefKey?: string;
}

interface WeaponFamilyEntry {
	id: string;
	displayName: string;
	type: 'weapon' | 'arm';
	customizationField?: string;
	customizationUnlocked: boolean | null;
	items: WeaponItemEntry[];
}

const props = defineProps<{
	family: WeaponFamilyEntry;
}>();

const emit = defineEmits<{
	'update:item-enabled': [{ saveField: string; value: boolean }];
	'update:item-equipped': [{ prefKey: string; value: boolean }];
	'update:customization-unlocked': [{ saveField: string; value: boolean }];
}>();
const failedIconItemIds = ref<Set<string>>(new Set());
const isWeaponFamily = computed(() => props.family.type === 'weapon');
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

function onCustomizationToggle(value: boolean) {
	if (!props.family.customizationField) {
		return;
	}

	emit('update:customization-unlocked', {
		saveField: props.family.customizationField,
		value,
	});
}

function onItemToggle(saveField: string, value: boolean) {
	emit('update:item-enabled', {
		saveField,
		value,
	});
}

function onBaseUnlockToggle(value: boolean) {
	for (const item of baseVariantItems.value) {
		onItemToggle(item.saveField, value);
	}
}

function onAlternateUnlockToggle(value: boolean) {
	for (const item of alternateItems.value) {
		onItemToggle(item.saveField, value);
	}
}

function onItemEquippedToggle(prefKey: string | undefined, value: boolean) {
	if (!prefKey) {
		return;
	}

	emit('update:item-equipped', {
		prefKey,
		value,
	});
}

function onItemIconError(itemId: string) {
	const next = new Set(failedIconItemIds.value);
	next.add(itemId);
	failedIconItemIds.value = next;
}
</script>

<template>
	<Card class="max-w-140 min-w-150 h-fit">
		<CardHeader>
			<CardTitle>{{ props.family.displayName }}</CardTitle>
			<CardDescription>
				Unlocked: <code>generalprogress.bepis</code> | Equipped:
				<code>Preferences/Prefs.json</code>
			</CardDescription>
		</CardHeader>

		<CardContent class="space-y-3">
			<div
				v-if="isWeaponFamily"
				class="space-y-2 rounded-md border border-primary/30 bg-primary/5 p-3"
			>
				<div class="flex items-center justify-between gap-4">
					<div>
						<p class="text-sm font-medium">Weapon Unlocked</p>
						<p class="text-xs text-muted-foreground">
							Applies to all standard variants in this family.
						</p>
					</div>
					<Switch
						:model-value="baseUnlocked"
						@update:model-value="onBaseUnlockToggle(Boolean($event))"
					/>
				</div>

				<div
					v-if="alternateItems.length"
					class="flex items-center justify-between gap-4"
				>
					<div>
						<p class="text-sm font-medium">Alternate Unlocked</p>
						<p class="text-xs text-muted-foreground">
							Applies to alternate version(s) in this family.
						</p>
					</div>
					<Switch
						:model-value="alternateUnlocked"
						@update:model-value="onAlternateUnlockToggle(Boolean($event))"
					/>
				</div>
			</div>

			<div
				v-if="props.family.customizationUnlocked !== null"
				class="flex items-center justify-between rounded-md border p-3"
			>
				<div>
					<p class="font-medium">Customization Unlocked</p>
					<p class="text-sm text-muted-foreground">
						Confirmed save flag: {{ props.family.customizationField }}
					</p>
				</div>

				<Switch
					:model-value="Boolean(props.family.customizationUnlocked)"
					@update:model-value="onCustomizationToggle(Boolean($event))"
				/>
			</div>

			<div
				v-for="item in props.family.items"
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
							<p class="text-sm text-muted-foreground">
								{{ item.saveField }}
							</p>

							<div class="mt-1 flex gap-2">
								<Badge v-if="item.isAlternate" variant="outline">
									Alternate
								</Badge>

								<Badge variant="secondary"> Slot: {{ item.color }} </Badge>
							</div>
						</div>
					</div>

					<div class="flex shrink-0 flex-col items-end gap-2">
						<span
							v-if="isWeaponFamily"
							class="text-xs text-muted-foreground"
						>
							{{
								item.isAlternate
									? alternateUnlocked
										? 'Unlocked'
										: 'Locked'
									: baseUnlocked
										? 'Unlocked'
										: 'Locked'
							}}
						</span>
						<div v-else class="flex items-center gap-2 text-xs">
							<Switch
								:model-value="item.enabled"
								@update:model-value="
									onItemToggle(item.saveField, Boolean($event))
								"
							/>
							<span>Unlocked</span>
						</div>

						<div
							class="flex items-center gap-2 text-xs"
							:class="item.equipped === null ? 'opacity-60' : ''"
						>
							<Switch
								:model-value="Boolean(item.equipped)"
								:disabled="item.equipped === null"
								@update:model-value="
									onItemEquippedToggle(item.equippedPrefKey, Boolean($event))
								"
							/>
							<span>Equipped</span>
						</div>
					</div>
				</div>
			</div>
		</CardContent>
	</Card>
</template>
