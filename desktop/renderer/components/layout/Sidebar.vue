<script setup lang="ts">
import { Badge, Button } from '@/components';

type MainSection = 'missions' | 'weapons';

const props = defineProps<{
	activeSection: MainSection;
	hasUnsavedChanges: boolean;
	modifiedEntryCount: number;
	loadedSaveFolder: string;
}>();

const emit = defineEmits<{
	'update:active-section': [value: MainSection];
}>();

function setActiveSection(value: MainSection) {
	emit('update:active-section', value);
}
</script>

<template>
	<aside class="w-72 border-r">
		<div class="p-4">
			<div class="mb-6">
				<img
					src="/misc/logo.png"
					alt="ULTRAKILL"
					class="mb-5 h-12 w-auto object-contain"
				/>

				<div class="flex items-center justify-between gap-2 mb-3">
					<p
						class="text-s font-medium uppercase tracking-wide text-muted-foreground"
					>
						Workspace
					</p>

					<Badge v-if="props.hasUnsavedChanges" variant="secondary">
						{{ props.modifiedEntryCount }} unsaved
					</Badge>
				</div>

				<p class="text-sm text-muted-foreground">
					Loaded Save data and editor controls
				</p>
			</div>

			<nav class="space-y-2">
				<Button
					:variant="props.activeSection === 'missions' ? 'secondary' : 'ghost'"
					class="w-full justify-start"
					@click="setActiveSection('missions')"
				>
					Missions
				</Button>

				<Button
					:variant="props.activeSection === 'weapons' ? 'secondary' : 'ghost'"
					class="w-full justify-start"
					@click="setActiveSection('weapons')"
				>
					Weapons
				</Button>
			</nav>

			<div class="mt-6 rounded-lg border p-3">
				<p
					class="text-xs font-medium uppercase tracking-wide text-muted-foreground"
				>
					Loaded Save folder
				</p>

				<p class="mt-2 break-all text-sm text-muted-foreground">
					{{ props.loadedSaveFolder }}
				</p>
			</div>
		</div>
	</aside>
</template>
