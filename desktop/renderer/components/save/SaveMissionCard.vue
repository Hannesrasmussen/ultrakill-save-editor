<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import MissionDetailsPanel from '@/components/save/MissionDetailsPanel.vue';
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components';
import type { QuickMissionRank } from '@/components/save/mission-panel-types';
import type { MissionEntry } from '@/lib/mission-editor-types';
import {
	hasMissionRankThresholds,
	type MissionStatCategory,
	type MissionStatRankLabel,
} from '@/lib/mission-rank-requirements';
import {
	ChevronDown,
	ChevronRight,
	FileCheck,
	FileWarning,
	KeyRound,
	LandPlot,
	Pencil,
	RotateCcw,
	Shield,
	Skull,
} from 'lucide-vue-next';

const props = defineProps<{
	entry: MissionEntry;
	noJargon?: boolean;
}>();

const emit = defineEmits<{
	'update:challenge-completed': [value: boolean];
	'update:rank': [value: QuickMissionRank];
	'update:stat-rank': [
		{ category: MissionStatCategory; rank: MissionStatRankLabel },
	];
	'update:major-assist': [value: boolean];
	'update:secret-found': [{ index: number; value: boolean }];
	'fill:secrets': [];
	'clear:secrets': [];
}>();

const isExpanded = ref(false);
const screenshotIndex = ref(0);

const missionCode = computed(() => props.entry.mission?.code ?? 'UNKNOWN');
const missionName = computed(
	() => props.entry.mission?.name ?? 'Unknown Mission',
);
const missionType = computed(() => props.entry.mission?.type ?? 'unknown');
const missionId = computed(
	() => props.entry.mission?.id ?? props.entry.data.levelNumber ?? null,
);
const missionScreenshots = computed(
	() => props.entry.mission?.screenshotCandidates ?? [],
);
const activeMissionScreenshot = computed(
	() => missionScreenshots.value[screenshotIndex.value] ?? null,
);
const RANK_CYCLE: QuickMissionRank[] = ['D', 'C', 'B', 'A', 'P'];

const typeLabel = computed(() => {
	switch (missionType.value) {
		case 'primary':
			return 'Primary Campaign';
		case 'encore':
			return 'Encore';
		case 'prime':
			return 'Prime Sanctum';
		case 'secret':
			return 'Secret';
		default:
			return 'Unknown';
	}
});

const typeIcon = computed(() => {
	switch (missionType.value) {
		case 'primary':
			return LandPlot;
		case 'encore':
			return RotateCcw;
		case 'prime':
			return Skull;
		case 'secret':
			return KeyRound;
		default:
			return Shield;
	}
});

const rankLabel = computed(() => {
	const rank = props.entry.rank;

	if (rank === null || rank === undefined || rank < 0) {
		return '-';
	}

	if (props.entry.majorAssist && rank === 12) {
		return 'S';
	}

	if (rank === 12) {
		return 'P';
	}

	if (rank >= 4 && rank <= 6) {
		return 'S';
	}

	if (rank === 3) {
		return 'A';
	}

	if (rank === 2) {
		return 'B';
	}

	if (rank === 1) {
		return 'C';
	}

	if (rank === 0) {
		return 'D';
	}

	return '-';
});

const rankBadgeClass = computed(() => {
	if (props.entry.majorAssist && rankLabel.value !== '-') {
		return 'border-sky-300 bg-sky-600 text-white';
	}

	if (rankLabel.value === '-') {
		return 'border-slate-400 bg-slate-600 text-white';
	}

	switch (rankLabel.value) {
		case 'P':
			return 'border-amber-300 bg-amber-500 text-white';
		case 'S':
			return 'border-red-300 bg-red-600 text-white';
		case 'A':
			return 'border-orange-300 bg-orange-500 text-white';
		case 'B':
			return 'border-yellow-300 bg-yellow-500 text-black';
		case 'C':
			return 'border-emerald-300 bg-emerald-500 text-black';
		case 'D':
			return 'border-sky-300 bg-sky-500 text-black';
		default:
			return 'border-slate-400 bg-slate-600 text-white';
	}
});

const challengeBadgeClass = computed(() => {
	return props.entry.challengeCompleted
		? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200'
		: 'border-amber-500/60 bg-amber-500/15 text-amber-200';
});

const challengeBadgeLabel = computed(() => {
	return props.entry.challengeCompleted
		? 'Challenge Complete'
		: 'Challenge Incomplete';
});
const canEditRank = computed(() => {
	return (
		props.entry.mission?.isKnown === true &&
		hasMissionRankThresholds(props.entry.mission?.code)
	);
});

watch(
	missionScreenshots,
	() => {
		screenshotIndex.value = 0;
	},
	{ immediate: true },
);

function onMissionScreenshotError() {
	const nextIndex = screenshotIndex.value + 1;

	if (nextIndex < missionScreenshots.value.length) {
		screenshotIndex.value = nextIndex;
		return;
	}

	screenshotIndex.value = missionScreenshots.value.length;
}

function onRankBadgeClick() {
	if (!canEditRank.value) {
		return;
	}

	const currentIndex = RANK_CYCLE.indexOf(rankLabel.value as QuickMissionRank);
	const nextIndex =
		currentIndex < 0 ? 0 : (currentIndex + 1) % RANK_CYCLE.length;

	emit('update:rank', RANK_CYCLE[nextIndex]);
}
</script>

<template>
	<Card
		:class="[
			'overflow-hidden border-border/80 pt-3 gap-0',
			isExpanded ? 'pb-3' : 'pb-0',
		]"
	>
		<CardHeader class="pb-2">
			<div class="flex flex-col gap-3">
				<div class="flex items-start justify-between gap-3">
					<div class="min-w-0 flex items-start gap-3">
						<div
							class="relative h-16 w-28 shrink-0 overflow-hidden rounded-md border border-border/80 bg-black/70"
						>
							<img
								v-if="activeMissionScreenshot"
								:key="activeMissionScreenshot"
								:src="activeMissionScreenshot"
								:alt="`${missionCode} screenshot`"
								class="h-full w-full object-cover"
								@error="onMissionScreenshotError"
							/>

							<div
								v-else
								class="absolute inset-0 flex items-center justify-center p-2 text-center text-[10px] text-muted-foreground"
							>
								No screenshot
							</div>
						</div>

						<div class="min-w-0 flex-1 space-y-1.5">
							<div class="flex items-center gap-2">
								<component
									:is="typeIcon"
									class="h-4 w-4 shrink-0 text-muted-foreground"
								/>

								<p
									class="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
								>
									{{ missionCode }}
								</p>
							</div>

							<CardTitle class="truncate text-base leading-tight">
								{{ missionName }}
							</CardTitle>

							<p v-if="props.noJargon" class="truncate text-xs text-muted-foreground">
								Mission save entry
							</p>

							<p v-else class="truncate text-xs text-muted-foreground">
								{{ entry.fileName }}
							</p>

							<div class="flex gap-2 overflow-x-auto pb-1 pr-1">
								<Badge variant="outline" class="shrink-0 whitespace-nowrap">
									{{ typeLabel }}
								</Badge>

								<Badge
									:variant="entry.existsInSave ? 'default' : 'secondary'"
									class="shrink-0 whitespace-nowrap"
								>
									<span class="inline-flex items-center gap-1">
										<FileCheck v-if="entry.existsInSave" class="h-3.5 w-3.5" />
										<FileWarning v-else class="h-3.5 w-3.5" />
										{{
											entry.existsInSave
												? props.noJargon
													? 'In save files'
													: 'Present'
												: props.noJargon
													? 'Missing save file'
													: 'Missing file'
										}}
									</span>
								</Badge>

								<Badge
									v-if="entry.isModified"
									variant="secondary"
									class="shrink-0 whitespace-nowrap"
								>
									<span
										class="inline-flex items-center gap-1 whitespace-nowrap"
									>
										<Pencil class="h-3.5 w-3.5" />
										Edited
									</span>
								</Badge>
							</div>
						</div>
					</div>

					<div class="flex shrink-0 items-start gap-2">
						<button
							type="button"
							class="relative inline-flex h-10 w-10 items-center justify-center rounded-md border text-xl font-bold leading-none transition hover:brightness-110"
							:class="[
								rankBadgeClass,
								canEditRank ? 'cursor-pointer' : 'cursor-default',
							]"
							:title="
								canEditRank
									? 'Click to cycle rank preset'
									: 'Rank preset unavailable for unknown mission'
							"
							:aria-label="
								canEditRank
									? `Cycle rank preset for ${missionCode}`
									: `Rank preset unavailable for ${missionCode}`
							"
							@click="onRankBadgeClick"
						>
							{{ rankLabel }}

							<Pencil
								v-if="canEditRank"
								class="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border border-border bg-background p-0.5 text-foreground"
							/>
						</button>

						<span
							class="inline-flex h-10 items-center rounded-md border px-3 text-xs font-medium whitespace-nowrap"
							:class="challengeBadgeClass"
						>
							{{ challengeBadgeLabel }}
						</span>
					</div>
				</div>

				<div
					class="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between"
				>
					<div
						class="flex min-w-0 gap-2 overflow-x-auto pb-1 pr-1 text-xs text-muted-foreground"
					>
						<span
							v-if="!props.noJargon"
							class="shrink-0 whitespace-nowrap rounded-md border px-2 py-1"
						>
							Mission ID: {{ missionId ?? '-' }}
						</span>

						<TooltipProvider v-if="!props.noJargon">
							<Tooltip>
								<TooltipTrigger>
									<span
										class="shrink-0 whitespace-nowrap rounded-md border px-2 py-1"
										:class="
											entry.mission?.isKnown
												? ['border-emerald-500 bg-emerald-400 text-white']
												: ['border-red-500 bg-red-400 text-white']
										"
									>
										{{ entry.mission?.isKnown ? 'Verified' : 'Unknown' }}
									</span>
								</TooltipTrigger>
								<TooltipContent>
									<p v-if="entry.mission?.isKnown">
										The editor knows this mission exists.
									</p>
									<p v-else>
										The editor is unaware of this mission's existence.. Is it
										new or part of a mod?
									</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>

						<span
							class="shrink-0 whitespace-nowrap rounded-md border px-2 py-1"
						>
							Major Assists: {{ entry.majorAssist ? 'On' : 'Off' }}
						</span>

						<span
							v-if="entry.secretsAmount > 0"
							class="shrink-0 whitespace-nowrap rounded-md border px-2 py-1"
						>
							Secrets: {{ entry.secretsFoundCount }} / {{ entry.secretsAmount }}
						</span>
					</div>

					<Button
						variant="outline"
						size="sm"
						class="w-full shrink-0 gap-2 lg:w-auto"
						@click="isExpanded = !isExpanded"
					>
						<ChevronDown v-if="isExpanded" class="h-4 w-4" />
						<ChevronRight v-else class="h-4 w-4" />
						{{
							props.noJargon
								? isExpanded
									? 'Hide details'
									: 'Show details'
								: isExpanded
									? 'Hide editor'
									: 'Open editor'
						}}
					</Button>
				</div>
			</div>
		</CardHeader>

		<CardContent v-if="isExpanded" class="space-y-5 border-t pt-5">
			<MissionDetailsPanel
				:entry="entry"
				:no-jargon="props.noJargon"
				@update:challenge-completed="emit('update:challenge-completed', $event)"
				@update:stat-rank="emit('update:stat-rank', $event)"
				@update:major-assist="emit('update:major-assist', $event)"
				@update:secret-found="emit('update:secret-found', $event)"
				@fill:secrets="emit('fill:secrets')"
				@clear:secrets="emit('clear:secrets')"
			/>
		</CardContent>
	</Card>
</template>
