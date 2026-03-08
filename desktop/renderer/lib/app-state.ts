import { computed, ref } from 'vue';
import { validateSave, type SaveValidationResult } from './save-validation';

export interface SaveScanResult {
	savesDirectory: string | null;
	slot: string | null;
	directory: string | null;
	levels: number[];
	special: number[];
	other: string[];
	slots: SaveSlotScanResult[];
}

export interface SaveSlotScanResult {
	slot: string;
	directory: string;
	levels: number[];
	special: number[];
	other: string[];
}

export interface DecodedSave {
	directory: string;
	levels: Record<string, unknown>;
	special: Record<string, unknown>;
	other: Record<string, unknown>;
}

export const saveFolderPath = ref<string | null>(null);
export const loadedSave = ref<DecodedSave | null>(null);

export const hasLoadedSave = computed(() => loadedSave.value !== null);

export const saveValidation = computed<SaveValidationResult | null>(() => {
	if (!loadedSave.value) {
		return null;
	}

	return validateSave(loadedSave.value);
});

export function setSaveFolder(path: string | null) {
	saveFolderPath.value = path;
}

export function setLoadedSave(save: DecodedSave | null) {
	loadedSave.value = save;
	saveFolderPath.value = save?.directory ?? null;
}

export function clearLoadedSave() {
	loadedSave.value = null;
	saveFolderPath.value = null;
}
