<script setup lang="ts">
import { ref, watch } from 'vue';
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Input,
	Switch,
} from '@/components';
import { Zap } from 'lucide-vue-next';
import WeaponFamilyCard from '@/components/save/WeaponFamilyCard.vue';
import {
	CONFIRMED_VANILLA_PROGRESS_FIELDS,
	CONFIRMED_VANILLA_PROGRESS_FILES,
	UNCONFIRMED_OR_OUT_OF_SCOPE_FIELDS,
	WEAPONS_SCOPE_NOTE,
} from '@/lib/vanilla-save-scope';

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
	altSelected: boolean | null;
	supportsAlt: boolean;
	altUnlockSaveField?: string;
	altUnlocked: boolean | null;
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

interface ExtraWeaponEntry {
	id: string;
	displayName: string;
	saveField: string;
	value: unknown;
}

const props = defineProps<{
	points: number;
	noJargon?: boolean;
	weaponFamilyEntries: WeaponFamilyEntry[];
	extraWeaponEntries: ExtraWeaponEntry[];
}>();

const emit = defineEmits<{
	'update:weapon-flag': [{ saveField: string; value: boolean }];
	'update:item-equipped': [{ prefKey: string; value: boolean }];
	'update:item-alt': [{ prefKey: string; value: boolean }];
	'update:points': [value: number];
	'quick-action:unlock-all': [];
	'quick-action:equip-all': [];
}>();
const pointsInput = ref(String(props.points));

watch(
	() => props.points,
	(value) => {
		pointsInput.value = String(value);
	},
);

function onPointsInput(value: string | number) {
	const nextValue = String(value);
	pointsInput.value = nextValue;

	const parsed = Number(nextValue);
	if (!Number.isFinite(parsed)) {
		return;
	}

	const normalized = Math.max(0, Math.floor(parsed));
	emit('update:points', normalized);
}

function commitPointsInput() {
	const parsed = Number(pointsInput.value);
	const normalized = Number.isFinite(parsed)
		? Math.max(0, Math.floor(parsed))
		: 0;
	pointsInput.value = String(normalized);
	emit('update:points', normalized);
}

function isBooleanLikeValue(value: unknown): boolean {
	return (
		typeof value === 'boolean' ||
		(typeof value === 'number' && (value === 0 || value === 1))
	);
}

function toBoolean(value: unknown): boolean {
	if (typeof value === 'boolean') {
		return value;
	}

	if (typeof value === 'number') {
		return value > 0;
	}

	return false;
}
</script>

<template>
	<div class="space-y-6">
		<Card v-if="!props.noJargon">
			<CardHeader>
				<CardTitle>Weapons Scope</CardTitle>
				<CardDescription>
					{{ WEAPONS_SCOPE_NOTE }}
				</CardDescription>
			</CardHeader>

			<CardContent class="space-y-4">
				<div class="grid gap-4 lg:grid-cols-2">
					<div class="rounded-md border p-3">
						<p class="text-sm font-medium">Included .bepis sources</p>
						<div class="mt-2 flex flex-wrap gap-2">
							<Badge
								v-for="source in CONFIRMED_VANILLA_PROGRESS_FILES"
								:key="source"
								variant="outline"
							>
								{{ source }}
							</Badge>
						</div>
					</div>

					<div class="rounded-md border p-3">
						<p class="text-sm font-medium">Confirmed progression fields</p>
						<div class="mt-2 flex flex-wrap gap-2">
							<Badge
								v-for="field in CONFIRMED_VANILLA_PROGRESS_FIELDS"
								:key="field"
								variant="outline"
							>
								{{ field }}
							</Badge>
						</div>
					</div>
				</div>

				<div class="rounded-md border border-amber-500/50 bg-amber-500/10 p-3">
					<p class="text-sm font-medium">Excluded until confirmed</p>
					<div class="mt-2 flex flex-wrap gap-2">
						<Badge
							v-for="field in UNCONFIRMED_OR_OUT_OF_SCOPE_FIELDS"
							:key="field"
							variant="outline"
							class="border-amber-500/50"
						>
							{{ field }}
						</Badge>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>
					<div class="flex items-center gap-2">
						<Zap class="h-4 w-4 text-amber-500" />
						<p class="text-sm font-medium">Quick Actions</p>
					</div>
				</CardTitle>
				<CardDescription>
					{{
						props.noJargon
							? 'Apply common weapon progress changes in one click.'
							: 'Bulk actions for weapon unlock and equip state.'
					}}
				</CardDescription>
			</CardHeader>

			<CardContent class="space-y-3">
				<div class="flex flex-wrap gap-2">
					<Button variant="secondary" @click="emit('quick-action:unlock-all')">
						Unlock everything
					</Button>
					<Button variant="outline" @click="emit('quick-action:equip-all')">
						Equip everything
					</Button>
				</div>
				<p class="text-xs text-muted-foreground">
					{{
						props.noJargon
							? "Equip everything keeps each variant's current normal/alternate choice."
							: "Equip everything uses each variant's current alt preference where applicable."
					}}
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Points</CardTitle>
				<CardDescription>
					{{
						props.noJargon
							? 'Your total P.'
							: 'Global save currency stored in generalprogress.bepis.money'
					}}
				</CardDescription>
			</CardHeader>

			<CardContent class="space-y-2">
				<Input
					type="number"
					min="0"
					step="1"
					inputmode="numeric"
					class="max-w-xs"
					:model-value="pointsInput"
					@update:model-value="onPointsInput"
					@blur="commitPointsInput"
				/>
				<p class="text-xs text-muted-foreground">
					Value is clamped to a non-negative integer.
				</p>
			</CardContent>
		</Card>

		<div class="flex flex-wrap gap-6 w-auto">
			<WeaponFamilyCard
				v-for="family in props.weaponFamilyEntries"
				:key="family.id"
				:family="family"
				:no-jargon="props.noJargon"
				@update:item-enabled="emit('update:weapon-flag', $event)"
				@update:item-equipped="emit('update:item-equipped', $event)"
				@update:item-alt="emit('update:item-alt', $event)"
				@update:customization-unlocked="emit('update:weapon-flag', $event)"
			/>
		</div>

		<Card v-if="props.extraWeaponEntries.length > 0">
			<CardHeader>
				<CardTitle>
					{{
						props.noJargon
							? 'Extra weapon values'
							: 'Extra weapon-related fields'
					}}
				</CardTitle>
				<CardDescription>
					{{
						props.noJargon
							? 'Advanced values that are still being verified.'
							: 'Fields present in the Save but not yet fully categorized'
					}}
				</CardDescription>
			</CardHeader>

			<CardContent class="space-y-3">
				<div
					v-for="field in props.extraWeaponEntries"
					:key="field.id"
					class="rounded-md border p-3"
				>
					<div class="flex items-center justify-between gap-4">
						<div>
							<p class="font-medium">{{ field.displayName }}</p>
							<p v-if="!props.noJargon" class="text-sm text-muted-foreground">
								{{ field.saveField }}
							</p>
						</div>

						<Switch
							v-if="isBooleanLikeValue(field.value)"
							:model-value="toBoolean(field.value)"
							@update:model-value="
								emit('update:weapon-flag', {
									saveField: field.saveField,
									value: Boolean($event),
								})
							"
						/>
						<div v-else class="text-sm font-medium">
							{{ field.value }}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>
</template>
