<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	rank: number | null;
	majorAssist: boolean;
	challengeCompleted: boolean;
	secretsFoundCount: number;
	secretsAmount: number;
	formattedTime: string;
	showTime?: boolean;
}>();

const showTime = computed(() => props.showTime !== false);

const metricGridClass = computed(() => {
	const metricCount =
		2 + (props.secretsAmount !== 0 ? 1 : 0) + (showTime.value ? 1 : 0);

	if (metricCount >= 4) {
		return 'grid-cols-2 lg:grid-cols-4';
	}

	if (metricCount === 3) {
		return 'grid-cols-1 sm:grid-cols-3';
	}

	return 'grid-cols-2';
});

const rankLabel = computed(() => {
	const rank = props.rank;

	if (rank === null || rank === undefined || rank < 0) {
		return '-';
	}

	if (props.majorAssist && rank === 12) {
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
	if (props.majorAssist && rankLabel.value !== '-') {
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
</script>

<template>
	<div class="grid gap-3" :class="metricGridClass">
		<div class="rounded-xl border bg-card/40 p-2.5">
			<p class="text-[11px] uppercase tracking-wide text-muted-foreground">
				Rank
			</p>
			<p
				class="mt-2 inline-flex h-10 w-10 items-center justify-center rounded-md border text-xl font-bold leading-none"
				:class="rankBadgeClass"
			>
				{{ rankLabel }}
			</p>
			<p v-if="props.majorAssist" class="mt-2 text-xs text-muted-foreground">
				Major assists on
			</p>
		</div>

		<div class="rounded-xl border bg-card/40 p-2.5">
			<p class="text-[11px] uppercase tracking-wide text-muted-foreground">
				Challenge
			</p>
			<p class="mt-2 text-base font-semibold">
				{{ props.challengeCompleted ? 'Complete' : 'Incomplete' }}
			</p>
		</div>

		<div
			v-if="props.secretsAmount !== 0"
			class="rounded-xl border bg-card/40 p-2.5"
		>
			<p class="text-[11px] uppercase tracking-wide text-muted-foreground">
				Secrets
			</p>
			<p class="mt-2 text-base font-semibold">
				{{ props.secretsFoundCount }} / {{ props.secretsAmount }}
			</p>
		</div>

		<div v-if="showTime" class="rounded-xl border bg-card/40 p-2.5">
			<p class="text-[11px] uppercase tracking-wide text-muted-foreground">
				Time
			</p>
			<p class="mt-2 text-base font-semibold">
				{{ props.formattedTime }}
			</p>
		</div>
	</div>
</template>
