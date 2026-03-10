<script setup lang="ts">
import { computed, ref } from 'vue';

import MissionGroupSection from '@/components/save/MissionGroupSection.vue';
import MissionPanelControls from '@/components/save/MissionPanelControls.vue';
import { Card, CardContent } from '@/components';
import type { DifficultyDefinition } from '@/lib/difficulty-registry';
import type {
	MissionEntry,
	SecretMissionEntry,
} from '@/lib/mission-editor-types';
import type {
	MissionGroupContent,
	MissionGroupKey,
	MissionTypeFilter,
	PresenceFilter,
	QuickMissionRank,
} from '@/components/save/mission-panel-types';
import type {
	MissionStatCategory,
	MissionStatRankLabel,
} from '@/lib/mission-rank-requirements';
import {
	buildMissionGroups,
	filterMissionEntries,
	filterSecretMissionEntries,
} from '@/components/save/mission-panel-view-model';

const props = defineProps<{
	difficulties: DifficultyDefinition[];
	selectedDifficultyId: number;
	noJargon?: boolean;
	missionEntries: MissionEntry[];
	secretMissionEntries: SecretMissionEntry[];
}>();

const emit = defineEmits<{
	'update:selected-difficulty-id': [value: number];
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
	'quick-action:complete-all-missions': [];
	'quick-action:set-all-ranks': [value: QuickMissionRank];
	'quick-action:set-all-secrets': [value: boolean];
	'quick-action:set-all-challenges': [value: boolean];
}>();

const searchQuery = ref('');
const typeFilter = ref<MissionTypeFilter>('all');
const presenceFilter = ref<PresenceFilter>('all');
const CARD_WIDTH_PX = 650;

const groupOrder: MissionGroupKey[] = [
	'prelude',
	'act-1',
	'act-2',
	'act-3',
	'encore',
	'prime',
	'secret',
	'unknown',
];

const filteredMissionEntries = computed(() => {
	return filterMissionEntries(props.missionEntries, {
		searchQuery: searchQuery.value,
		typeFilter: typeFilter.value,
		presenceFilter: presenceFilter.value,
	});
});

const filteredSecretMissionEntries = computed(() => {
	return filterSecretMissionEntries(props.secretMissionEntries, {
		searchQuery: searchQuery.value,
		typeFilter: typeFilter.value,
		presenceFilter: presenceFilter.value,
	});
});

const groupedContent = computed<MissionGroupContent[]>(() => {
	return buildMissionGroups(
		filteredMissionEntries.value,
		filteredSecretMissionEntries.value,
		groupOrder,
	);
});

const visibleMissionCount = computed(
	() =>
		filteredMissionEntries.value.length +
		filteredSecretMissionEntries.value.length,
);

const missingMissionCount = computed(
	() =>
		filteredMissionEntries.value.filter((entry) => !entry.existsInSave).length,
);

const modifiedMissionCount = computed(() => {
	const missionModified = filteredMissionEntries.value.filter(
		(entry) => entry.isModified,
	).length;
	const secretModified = filteredSecretMissionEntries.value.filter(
		(entry) => entry.isModified,
	).length;

	return missionModified + secretModified;
});

function updateDifficulty(value: number) {
	emit('update:selected-difficulty-id', value);
}
</script>

<template>
	<div class="w-full space-y-6">
		<MissionPanelControls
			:difficulties="difficulties"
			:selected-difficulty-id="selectedDifficultyId"
			:no-jargon="props.noJargon"
			:search-query="searchQuery"
			:type-filter="typeFilter"
			:presence-filter="presenceFilter"
			:visible-mission-count="visibleMissionCount"
			:missing-mission-count="missingMissionCount"
			:modified-mission-count="modifiedMissionCount"
			@update:search-query="searchQuery = $event"
			@update:selected-difficulty-id="updateDifficulty"
			@update:type-filter="typeFilter = $event"
			@update:presence-filter="presenceFilter = $event"
			@quick-action:complete-all-missions="
				$emit('quick-action:complete-all-missions')
			"
			@quick-action:set-all-ranks="$emit('quick-action:set-all-ranks', $event)"
			@quick-action:set-all-secrets="
				$emit('quick-action:set-all-secrets', $event)
			"
			@quick-action:set-all-challenges="
				$emit('quick-action:set-all-challenges', $event)
			"
		/>

		<div v-if="groupedContent.length" class="space-y-8">
			<MissionGroupSection
				v-for="group in groupedContent"
				:key="group.key"
				:group="group"
				:no-jargon="props.noJargon"
				:card-width-px="CARD_WIDTH_PX"
				@update:rank="$emit('update:rank', $event)"
				@update:stat-rank="$emit('update:stat-rank', $event)"
				@update:challenge-completed="
					$emit('update:challenge-completed', $event)
				"
				@update:major-assist="$emit('update:major-assist', $event)"
				@update:secret-found="$emit('update:secret-found', $event)"
				@fill:secrets="$emit('fill:secrets', $event)"
				@clear:secrets="$emit('clear:secrets', $event)"
				@update:secret-mission-unlocked="
					$emit('update:secret-mission-unlocked', $event)
				"
				@update:secret-mission-completed="
					$emit('update:secret-mission-completed', $event)
				"
			/>
		</div>

		<Card v-else>
			<CardContent class="py-6">
				<p class="text-sm text-muted-foreground">
					{{
						props.noJargon
							? 'No missions match your current search and filters.'
							: 'No missions match the current search and filter settings.'
					}}
				</p>
			</CardContent>
		</Card>
	</div>
</template>
