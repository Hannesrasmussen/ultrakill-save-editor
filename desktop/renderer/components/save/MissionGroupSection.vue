<script setup lang="ts">
import { Badge } from '@/components';
import SaveMissionCard from '@/components/save/SaveMissionCard.vue';
import SaveSecretMissionCard from '@/components/save/SaveSecretMissionCard.vue';
import type {
	MissionGroupContent,
	QuickMissionRank,
} from '@/components/save/mission-panel-types';
import type {
	MissionStatCategory,
	MissionStatRankLabel,
} from '@/lib/mission-rank-requirements';

const props = defineProps<{
	group: MissionGroupContent;
	cardWidthPx: number;
}>();

const emit = defineEmits<{
	'update:challenge-completed': [{ fileName: string; value: boolean }];
	'update:rank': [{ fileName: string; value: QuickMissionRank }];
	'update:stat-rank': [
		{
			fileName: string;
			category: MissionStatCategory;
			rank: MissionStatRankLabel;
		},
	];
	'update:major-assist': [{ fileName: string; value: boolean }];
	'update:secret-found': [{ fileName: string; index: number; value: boolean }];
	'fill:secrets': [{ fileName: string }];
	'clear:secrets': [{ fileName: string }];
	'update:secret-mission-unlocked': [{ secretIndex: number; value: boolean }];
	'update:secret-mission-completed': [{ secretIndex: number; value: boolean }];
}>();
</script>

<template>
	<section class="space-y-4">
		<div class="flex items-end justify-between gap-3 border-b pb-3">
			<div>
				<h3 class="text-lg font-semibold tracking-tight">
					{{ props.group.label }}
				</h3>

				<p class="mt-1 text-sm text-muted-foreground">
					{{ props.group.missions.length + props.group.secretMissions.length }}
					mission{{
						props.group.missions.length + props.group.secretMissions.length ===
						1
							? ''
							: 's'
					}}
				</p>
			</div>

			<Badge variant="outline">
				{{ props.group.key }}
			</Badge>
		</div>

		<div
			v-if="props.group.secretMissions.length"
			class="flex flex-wrap items-start gap-4"
		>
			<div
				v-for="entry in props.group.secretMissions"
				:key="entry.secretIndex"
				class="w-full shrink-0"
				:style="{ width: `min(100%, ${props.cardWidthPx}px)` }"
			>
				<SaveSecretMissionCard
					class="w-full"
					:entry="entry"
					@update:unlocked="
						(value) =>
							emit('update:secret-mission-unlocked', {
								secretIndex: entry.secretIndex,
								value,
							})
					"
					@update:completed="
						(value) =>
							emit('update:secret-mission-completed', {
								secretIndex: entry.secretIndex,
								value,
							})
					"
				/>
			</div>
		</div>

		<div
			v-if="props.group.missions.length"
			class="flex flex-wrap items-start gap-4"
		>
			<div
				v-for="entry in props.group.missions"
				:key="entry.fileName"
				class="w-full shrink-0"
				:style="{ width: `min(100%, ${props.cardWidthPx}px)` }"
			>
				<SaveMissionCard
					class="w-full"
					:entry="entry"
					@update:rank="
						(value) =>
							emit('update:rank', {
								fileName: entry.fileName,
								value,
							})
					"
					@update:challenge-completed="
						(value) =>
							emit('update:challenge-completed', {
								fileName: entry.fileName,
								value,
							})
					"
					@update:stat-rank="
						(payload) =>
							emit('update:stat-rank', {
								fileName: entry.fileName,
								category: payload.category,
								rank: payload.rank,
							})
					"
					@update:major-assist="
						(value) =>
							emit('update:major-assist', {
								fileName: entry.fileName,
								value,
							})
					"
					@update:secret-found="
						(payload) =>
							emit('update:secret-found', {
								fileName: entry.fileName,
								index: payload.index,
								value: payload.value,
							})
					"
					@fill:secrets="
						emit('fill:secrets', {
							fileName: entry.fileName,
						})
					"
					@clear:secrets="
						emit('clear:secrets', {
							fileName: entry.fileName,
						})
					"
				/>
			</div>
		</div>
	</section>
</template>
