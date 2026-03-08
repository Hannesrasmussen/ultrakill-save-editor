<script setup lang="ts">
import { computed } from 'vue';

import {
	Button,
	Checkbox,
	Switch,
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components';
import { getStatRankButtonClass } from '@/components/save/rank-button-styles';
import type { MissionEntry } from '@/lib/mission-editor-types';
import {
	getMissionStatRank,
	hasMissionRankThresholds,
	type MissionStatCategory,
	type MissionStatRankLabel,
} from '@/lib/mission-rank-requirements';
import {
	Clock3,
	Flag,
	KeyRound,
	LandPlot,
	RotateCcw,
	Shield,
} from 'lucide-vue-next';

const props = defineProps<{
	entry: MissionEntry;
}>();

const emit = defineEmits<{
	'update:challenge-completed': [value: boolean];
	'update:major-assist': [value: boolean];
	'update:secret-found': [{ index: number; value: boolean }];
	'update:stat-rank': [
		{ category: MissionStatCategory; rank: MissionStatRankLabel },
	];
	'fill:secrets': [];
	'clear:secrets': [];
}>();

const statRankOptions: MissionStatRankLabel[] = ['D', 'C', 'B', 'A', 'S'];

const secretSlots = computed(() => {
	const amount = Math.max(0, props.entry.secretsAmount);
	const current = props.entry.data.secretsFound ?? [];

	return Array.from({ length: amount }, (_, index) => ({
		index,
		found: Boolean(current[index]),
	}));
});

const canEditSecrets = computed(() => props.entry.secretsAmount > 0);

const formattedTime = computed(() => {
	const time = props.entry.stats?.time;

	if (typeof time !== 'number') {
		return '-';
	}

	return `${time.toFixed(2)}s`;
});

const formattedKills = computed(() => {
	const kills = props.entry.stats?.kills;

	return typeof kills === 'number' ? String(kills) : '-';
});

const formattedStyle = computed(() => {
	const style = props.entry.stats?.style;

	return typeof style === 'number' ? String(style) : '-';
});

const canEditStatRanks = computed(() => {
	return (
		props.entry.mission?.isKnown === true &&
		hasMissionRankThresholds(props.entry.mission?.code)
	);
});

const timeRank = computed(() => {
	return getMissionStatRank(
		props.entry.mission?.code,
		'time',
		props.entry.stats?.time,
	);
});

const killsRank = computed(() => {
	return getMissionStatRank(
		props.entry.mission?.code,
		'kills',
		props.entry.stats?.kills,
	);
});

const styleRank = computed(() => {
	return getMissionStatRank(
		props.entry.mission?.code,
		'style',
		props.entry.stats?.style,
	);
});

function onSecretChecked(index: number, checked: boolean | 'indeterminate') {
	emit('update:secret-found', {
		index,
		value: checked === true,
	});
}

function onStatRankSelect(
	category: MissionStatCategory,
	rank: MissionStatRankLabel,
) {
	emit('update:stat-rank', {
		category,
		rank,
	});
}
</script>

<template>
	<p v-if="!props.entry.existsInSave" class="text-sm text-muted-foreground">
		This mission does not currently have a local .bepis file. The editor is
		showing a default scaffold so it can be created on export.
	</p>

	<div class="grid gap-4 xl:grid-cols-2">
		<div class="rounded-2xl border p-4">
			<div class="flex items-center justify-between gap-3">
				<div class="min-w-0">
					<div class="flex items-center gap-2">
						<Flag class="h-4 w-4 text-muted-foreground" />
						<h3 class="text-sm font-semibold">Challenge</h3>
					</div>

					<p class="mt-1 text-sm text-muted-foreground">
						Mark the mission challenge as completed or incomplete.
					</p>
				</div>

				<Switch
					:model-value="props.entry.challengeCompleted"
					@update:model-value="emit('update:challenge-completed', $event)"
				/>
			</div>
		</div>

		<div class="rounded-2xl border p-4">
			<div class="flex items-center justify-between gap-3">
				<div class="min-w-0">
					<div class="flex items-center gap-2">
						<Shield class="h-4 w-4 text-muted-foreground" />
						<h3 class="text-sm font-semibold">Major Assists</h3>
					</div>

					<p class="mt-1 text-sm text-muted-foreground">
						Toggle the selected difficulty's major assist flag.
					</p>
				</div>

				<Switch
					:model-value="props.entry.majorAssist"
					@update:model-value="emit('update:major-assist', $event)"
				/>
			</div>
		</div>
	</div>

	<div class="rounded-2xl border p-4">
		<div
			class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
		>
			<div>
				<div class="flex items-center gap-2">
					<KeyRound class="h-4 w-4 text-muted-foreground" />
					<h3 class="text-sm font-semibold">Secret Flags</h3>
				</div>

				<p class="mt-1 text-sm text-muted-foreground">
					Toggle individual secret completion flags for this mission.
				</p>
			</div>

			<div class="flex flex-wrap gap-2">
				<Button
					variant="outline"
					size="sm"
					:disabled="!canEditSecrets"
					@click="emit('fill:secrets')"
				>
					Fill
				</Button>

				<Button
					variant="outline"
					size="sm"
					:disabled="!canEditSecrets"
					@click="emit('clear:secrets')"
				>
					Clear
				</Button>
			</div>
		</div>

		<div
			v-if="secretSlots.length"
			class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
		>
			<div
				v-for="slot in secretSlots"
				:key="slot.index"
				class="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/30"
			>
				<Checkbox
					:model-value="slot.found"
					@update:model-value="onSecretChecked(slot.index, $event)"
				/>

				<div class="min-w-0">
					<p class="text-sm font-medium">Secret {{ slot.index + 1 }}</p>
					<p class="text-xs text-muted-foreground">
						{{ slot.found ? 'Found' : 'Not found' }}
					</p>
				</div>
			</div>
		</div>

		<p v-else class="mt-4 text-sm text-muted-foreground">
			This mission currently has no configured secret slots.
		</p>
	</div>

	<div class="flex justify-end">
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<span
						class="cursor-help text-xs font-medium text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
					>
						Why can&apos;t I edit the numbers?
					</span>
				</TooltipTrigger>
				<TooltipContent class="max-w-sm">
					<p class="text-xs leading-relaxed max-w-55">
						Raw stat editing is intentionally restricted. This editor applies
						rank presets to keep mission records consistent and avoid enabling
						fake speedrun/perfomance values. Sorry for the inconvenience.
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	</div>

	<div class="grid gap-4 sm:grid-cols-3">
		<div class="rounded-2xl border p-4">
			<div class="flex items-center gap-2">
				<LandPlot class="h-4 w-4 text-muted-foreground" />
				<p class="text-sm font-medium">Kills</p>
			</div>

			<p class="mt-2 text-lg font-semibold">
				{{ formattedKills }}
			</p>

			<div class="mt-3 flex flex-wrap gap-1.5">
				<Button
					v-for="rank in statRankOptions"
					:key="`kills-${rank}`"
					size="sm"
					variant="outline"
					:class="getStatRankButtonClass(rank, killsRank === rank)"
					:disabled="!canEditStatRanks"
					@click="onStatRankSelect('kills', rank)"
				>
					{{ rank }}
				</Button>
			</div>
		</div>

		<div class="rounded-2xl border p-4">
			<div class="flex items-center gap-2">
				<RotateCcw class="h-4 w-4 text-muted-foreground" />
				<p class="text-sm font-medium">Style</p>
			</div>

			<p class="mt-2 text-lg font-semibold">
				{{ formattedStyle }}
			</p>

			<div class="mt-3 flex flex-wrap gap-1.5">
				<Button
					v-for="rank in statRankOptions"
					:key="`style-${rank}`"
					size="sm"
					variant="outline"
					:class="getStatRankButtonClass(rank, styleRank === rank)"
					:disabled="!canEditStatRanks"
					@click="onStatRankSelect('style', rank)"
				>
					{{ rank }}
				</Button>
			</div>
		</div>

		<div class="rounded-2xl border p-4">
			<div class="flex items-center gap-2">
				<Clock3 class="h-4 w-4 text-muted-foreground" />
				<p class="text-sm font-medium">Time</p>
			</div>

			<p class="mt-2 text-lg font-semibold">
				{{ formattedTime }}
			</p>

			<div class="mt-3 flex flex-wrap gap-1.5">
				<Button
					v-for="rank in statRankOptions"
					:key="`time-${rank}`"
					size="sm"
					variant="outline"
					:class="getStatRankButtonClass(rank, timeRank === rank)"
					:disabled="!canEditStatRanks"
					@click="onStatRankSelect('time', rank)"
				>
					{{ rank }}
				</Button>
			</div>
		</div>
	</div>

	<p class="text-xs text-muted-foreground">
		Mission rank is derived from Time/Kills/Style points minus checkpoint
		restarts. <span class="font-medium text-foreground">P</span> requires a full
		15-point score with Major Assists disabled.
	</p>

	<p v-if="!canEditStatRanks" class="text-xs text-muted-foreground">
		Stat rank presets are unavailable for unknown missions.
	</p>
</template>
