<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import {
	Badge,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Switch,
} from '@/components';
import type { SecretMissionEntry } from '@/lib/mission-editor-types';
import { KeyRound, Lock, CheckCircle2 } from 'lucide-vue-next';

const props = defineProps<{
	entry: SecretMissionEntry;
}>();

const emit = defineEmits<{
	'update:unlocked': [value: boolean];
	'update:completed': [value: boolean];
}>();

const screenshotIndex = ref(0);
const secretMissionScreenshots = computed(
	() => props.entry.screenshotCandidates,
);
const activeSecretMissionScreenshot = computed(
	() => secretMissionScreenshots.value[screenshotIndex.value] ?? null,
);

watch(
	secretMissionScreenshots,
	() => {
		screenshotIndex.value = 0;
	},
	{ immediate: true },
);

function onSecretMissionScreenshotError() {
	const nextIndex = screenshotIndex.value + 1;

	if (nextIndex < secretMissionScreenshots.value.length) {
		screenshotIndex.value = nextIndex;
		return;
	}

	screenshotIndex.value = secretMissionScreenshots.value.length;
}
</script>

<template>
	<Card class="overflow-hidden border-border/80 pt-3 pb-3 gap-0">
		<CardHeader class="pb-2">
			<div class="flex flex-col gap-4">
				<div class="flex items-start gap-3">
					<div
						class="relative h-16 w-28 shrink-0 overflow-hidden rounded-md border border-border/80 bg-black/70"
					>
						<img
							v-if="activeSecretMissionScreenshot"
							:key="activeSecretMissionScreenshot"
							:src="activeSecretMissionScreenshot"
							:alt="`${entry.code} screenshot`"
							class="h-full w-full object-cover"
							@error="onSecretMissionScreenshotError"
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
							<KeyRound class="h-4 w-4 shrink-0 text-muted-foreground" />
							<p
								class="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
							>
								{{ entry.code }}
							</p>
						</div>

						<CardTitle class="truncate text-base leading-tight">
							{{ entry.name }}
						</CardTitle>

						<p class="text-xs text-muted-foreground">Secret mission state</p>

						<div class="flex gap-2 overflow-x-auto pb-1 pr-1">
							<Badge variant="outline" class="shrink-0 whitespace-nowrap">
								Secret
							</Badge>

							<Badge
								v-if="entry.isModified"
								variant="secondary"
								class="shrink-0 whitespace-nowrap"
							>
								Edited
							</Badge>
						</div>
					</div>
				</div>
			</div>
		</CardHeader>

		<CardContent class="space-y-4 pt-3">
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="rounded-xl border p-3">
					<div class="flex items-center justify-between gap-3">
						<div class="min-w-0">
							<div class="flex items-center gap-2">
								<Lock class="h-4 w-4 text-muted-foreground" />
								<p class="text-sm font-medium">Unlocked</p>
							</div>

							<p class="mt-1 text-xs text-muted-foreground">
								Whether the mission is available.
							</p>
						</div>

						<Switch
							:model-value="entry.unlocked"
							@update:model-value="$emit('update:unlocked', $event)"
						/>
					</div>
				</div>

				<div class="rounded-xl border p-3">
					<div class="flex items-center justify-between gap-3">
						<div class="min-w-0">
							<div class="flex items-center gap-2">
								<CheckCircle2 class="h-4 w-4 text-muted-foreground" />
								<p class="text-sm font-medium">Completed</p>
							</div>

							<p class="mt-1 text-xs text-muted-foreground">
								Whether the mission has been completed.
							</p>
						</div>

						<Switch
							:model-value="entry.completed"
							@update:model-value="$emit('update:completed', $event)"
						/>
					</div>
				</div>
			</div>

			<div class="flex flex-wrap gap-2 text-xs text-muted-foreground">
				<span class="rounded-md border px-2 py-1">
					Save value: {{ entry.stateValue }}
				</span>

				<span class="rounded-md border px-2 py-1">
					Index: {{ entry.secretIndex }}
				</span>
			</div>
		</CardContent>
	</Card>
</template>
