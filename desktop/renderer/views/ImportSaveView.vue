<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	setLoadedSave,
	type SaveScanResult,
	type SaveSlotScanResult,
} from '@/lib/app-state';

const router = useRouter();

const isScanning = ref(false);
const isImporting = ref(false);
const errorMessage = ref<string | null>(null);
const detectedSaveFolder = ref<string | null>(null);
const detectedSlots = ref<SaveSlotScanResult[]>([]);
const selectedSlotDirectory = ref<string | null>(null);

const selectedSlot = computed(() => {
	return (
		detectedSlots.value.find(
			(slot) => slot.directory === selectedSlotDirectory.value,
		) ?? null
	);
});
const canImport = computed(() => Boolean(selectedSlotDirectory.value));

function slotSummary(slot: SaveSlotScanResult) {
	const missionFiles = slot.levels.length + slot.special.length;
	const totalFiles = missionFiles + slot.other.length;

	return `${slot.slot} - ${missionFiles} missions - ${totalFiles} files`;
}

function onSlotChange(value: string | number | null | undefined) {
	if (typeof value !== 'string' || !value) {
		return;
	}

	selectedSlotDirectory.value = value;
	detectedSaveFolder.value = value;
}

function normalizeSlots(scanResult: SaveScanResult | null | undefined) {
	if (!scanResult || !Array.isArray(scanResult.slots)) {
		return [];
	}

	return scanResult.slots.filter(
		(slot): slot is SaveSlotScanResult =>
			Boolean(slot?.slot) && Boolean(slot?.directory),
	);
}

async function importSave() {
	try {
		if (!detectedSlots.value.length) {
			await scanSlots();
		}

		const selected = detectedSlots.value.find(
			(slot) => slot.directory === selectedSlotDirectory.value,
		);

		if (!selected) {
			errorMessage.value = 'No Save slot selected.';
			return;
		}

		errorMessage.value = null;
		isImporting.value = true;

		const decodedSave = await window.api.decode(selected.directory);

		if (!decodedSave?.directory) {
			errorMessage.value = 'A slot was found, but decoding failed.';
			return;
		}

		setLoadedSave(decodedSave);
		router.push('/editor');
	} catch (error) {
		console.error(error);
		errorMessage.value = 'Failed to import Save.';
	} finally {
		isImporting.value = false;
	}
}

async function scanSlots() {
	errorMessage.value = null;
	isScanning.value = true;

	try {
		const scanResult = await window.api.scan();
		const slots = normalizeSlots(scanResult);
		detectedSlots.value = slots;

		if (!slots.length) {
			selectedSlotDirectory.value = null;
			detectedSaveFolder.value = null;
			errorMessage.value = 'No ULTRAKILL save slots were found.';
			return;
		}

		const preferredSelection = slots.find(
			(slot) => slot.directory === selectedSlotDirectory.value,
		);
		const defaultSelection =
			preferredSelection ??
			slots.find((slot) => slot.slot.toLowerCase() === 'slot1') ??
			slots[0];

		selectedSlotDirectory.value = defaultSelection.directory;
		detectedSaveFolder.value = defaultSelection.directory;
	} catch (error) {
		console.error(error);
		detectedSlots.value = [];
		selectedSlotDirectory.value = null;
		detectedSaveFolder.value = null;
		errorMessage.value = 'Failed to scan Save slots.';
	} finally {
		isScanning.value = false;
	}
}

onMounted(() => {
	void scanSlots();
});
</script>

<template>
	<div class="flex h-full items-center justify-center p-6">
		<Card class="w-full max-w-2xl">
			<CardHeader>
				<CardTitle>Import Save</CardTitle>
				<CardDescription>
					Load a Save folder to view and edit its data.
				</CardDescription>
			</CardHeader>

			<CardContent class="space-y-6">
				<div
					class="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground"
				>
					Drop Save folder here
				</div>

				<div class="space-y-3">
					<div class="space-y-2">
						<p class="text-sm font-medium">Save slot</p>

						<Select
							v-if="detectedSlots.length"
							:model-value="selectedSlotDirectory ?? ''"
							@update:model-value="onSlotChange"
						>
							<SelectTrigger aria-label="Select Save slot" class="w-full">
								<SelectValue placeholder="Select a slot" />
							</SelectTrigger>

							<SelectContent>
								<SelectItem
									v-for="slot in detectedSlots"
									:key="slot.directory"
									:value="slot.directory"
								>
									{{ slotSummary(slot) }}
								</SelectItem>
							</SelectContent>
						</Select>

						<p v-else class="text-sm text-muted-foreground">
							Scanning save slots...
						</p>
					</div>

					<div>
						<p class="text-sm font-medium">Save folder</p>
						<p class="break-all text-sm text-muted-foreground">
							{{ detectedSaveFolder ?? 'No Save folder loaded.' }}
						</p>
					</div>

					<p v-if="selectedSlot" class="text-sm text-muted-foreground">
						{{ selectedSlot.slot }} contains
						{{ selectedSlot.levels.length + selectedSlot.special.length }}
						mission files.
					</p>

					<p v-if="errorMessage" class="text-sm text-red-400">
						{{ errorMessage }}
					</p>
				</div>

				<Separator />

				<p class="text-sm text-muted-foreground">
					A Save is the full set of <code>.bepis</code> files inside
					<code>Saves/Slot1</code>, <code>Saves/Slot2</code>, etc.
				</p>
			</CardContent>

			<CardFooter class="justify-end">
				<Button
					variant="outline"
					class="mr-2"
					:disabled="isImporting || isScanning"
					@click="scanSlots"
				>
					{{ isScanning ? 'Scanning...' : 'Rescan Slots' }}
				</Button>

				<Button
					@click="importSave"
					:disabled="isImporting || isScanning || !canImport"
				>
					{{ isImporting ? 'Importing...' : 'Import Save' }}
				</Button>
			</CardFooter>
		</Card>
	</div>
</template>
