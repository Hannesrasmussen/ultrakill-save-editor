<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  setLoadedSave,
  type SaveScanResult,
  type SaveSlotScanResult,
} from "@/lib/app-state";

const router = useRouter();

const isScanning = ref(false);
const isImporting = ref(false);
const isDraggingSaveFolder = ref(false);
const dragDepth = ref(0);
const errorMessage = ref<string | null>(null);
const detectedSaveFolder = ref<string | null>(null);
const detectedSlots = ref<SaveSlotScanResult[]>([]);
const selectedSlotDirectory = ref<string | null>(null);
type DroppedFile = File & { path?: string };

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

function normalizePathForComparison(path: string) {
  return path.replace(/[\\/]+$/, "").toLowerCase();
}

function getPathBaseName(path: string) {
  const trimmedPath = path.replace(/[\\/]+$/, "");
  const parts = trimmedPath.split(/[\\/]/);
  return parts[parts.length - 1] ?? trimmedPath;
}

function isSavesDirectoryPath(path: string) {
  return getPathBaseName(path).toLowerCase() === "saves";
}

function isSlotDirectoryPath(path: string) {
  return /^slot\d+$/i.test(getPathBaseName(path));
}

function hasSupportedDropPayload(event: DragEvent) {
  const types = Array.from(event.dataTransfer?.types ?? []);
  return (
    types.includes("Files") ||
    types.includes("text/uri-list") ||
    types.includes("text/plain")
  );
}

function stripWrappingQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function parseFileUrlToPath(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "file:") {
      return null;
    }

    let pathname = decodeURIComponent(parsed.pathname);
    if (/^\/[a-z]:/i.test(pathname)) {
      pathname = pathname.slice(1);
    }

    return pathname.replace(/\//g, "\\");
  } catch {
    return null;
  }
}

function parsePathFromTransferText(rawText: string) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => stripWrappingQuotes(line.trim()))
    .filter(Boolean);

  for (const line of lines) {
    if (line.startsWith("#")) {
      continue;
    }

    const parsedFileUrlPath = parseFileUrlToPath(line);
    if (parsedFileUrlPath) {
      return parsedFileUrlPath;
    }

    if (/^[a-z]:[\\/]/i.test(line) || line.startsWith("\\\\")) {
      return line;
    }
  }

  return null;
}

function getPathFromDroppedFile(file: File | null | undefined) {
  if (!file) {
    return null;
  }

  const resolvedFromWebUtils = window.api.getPathForFile(file);
  if (typeof resolvedFromWebUtils === "string" && resolvedFromWebUtils.trim()) {
    return resolvedFromWebUtils.trim();
  }

  const droppedFile = file as DroppedFile;
  if (typeof droppedFile.path === "string" && droppedFile.path.trim()) {
    return droppedFile.path.trim();
  }

  return null;
}

function getDroppedPath(event: DragEvent) {
  const transfer = event.dataTransfer;
  if (!transfer) {
    return null;
  }

  for (const file of Array.from(transfer.files)) {
    const resolvedPath = getPathFromDroppedFile(file);
    if (resolvedPath) {
      return resolvedPath;
    }
  }

  for (const item of Array.from(transfer.items)) {
    const resolvedPath = getPathFromDroppedFile(item.getAsFile());
    if (resolvedPath) {
      return resolvedPath;
    }
  }

  const uriListPath = parsePathFromTransferText(
    transfer.getData("text/uri-list"),
  );
  if (uriListPath) {
    return uriListPath;
  }

  const plainTextPath = parsePathFromTransferText(
    transfer.getData("text/plain"),
  );
  if (plainTextPath) {
    return plainTextPath;
  }

  return null;
}

function onSlotChange(value: string | number | null | undefined) {
  if (typeof value !== "string" || !value) {
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

function onDropZoneDragEnter(event: DragEvent) {
  if (!hasSupportedDropPayload(event)) {
    return;
  }

  dragDepth.value += 1;
  isDraggingSaveFolder.value = true;
}

function onDropZoneDragOver(event: DragEvent) {
  if (!hasSupportedDropPayload(event)) {
    return;
  }

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "copy";
  }
}

function onDropZoneDragLeave(event: DragEvent) {
  if (!hasSupportedDropPayload(event)) {
    return;
  }

  dragDepth.value = Math.max(0, dragDepth.value - 1);
  if (dragDepth.value === 0) {
    isDraggingSaveFolder.value = false;
  }
}

async function scanDroppedFolder(folderPath: string) {
  errorMessage.value = null;
  isScanning.value = true;

  try {
    const scanResult = await window.api.scanSaveFolder(folderPath);
    const slots = normalizeSlots(scanResult);
    detectedSlots.value = slots;

    if (!slots.length) {
      selectedSlotDirectory.value = null;
      detectedSaveFolder.value = scanResult.savesDirectory ?? folderPath;
      errorMessage.value =
        "No ULTRAKILL save slots were found in the dropped folder.";
      return;
    }

    const shouldPickSlotManually =
      isSavesDirectoryPath(folderPath) && slots.length > 1;
    if (shouldPickSlotManually) {
      selectedSlotDirectory.value = null;
      detectedSaveFolder.value = scanResult.savesDirectory ?? folderPath;
      errorMessage.value = `Found ${slots.length} save slots. Select one to continue.`;
      return;
    }

    const droppedSlotSelection = isSlotDirectoryPath(folderPath)
      ? slots.find(
          (slot) =>
            normalizePathForComparison(slot.directory) ===
            normalizePathForComparison(folderPath),
        )
      : null;
    const defaultSelection =
      droppedSlotSelection ??
      slots.find((slot) => slot.slot.toLowerCase() === "slot1") ??
      slots[0];

    selectedSlotDirectory.value = defaultSelection.directory;
    detectedSaveFolder.value = defaultSelection.directory;
  } catch (error) {
    console.error(error);
    detectedSlots.value = [];
    selectedSlotDirectory.value = null;
    detectedSaveFolder.value = null;
    errorMessage.value =
      "Failed to read dropped folder. Drop a ULTRAKILL Saves folder or Slot folder.";
  } finally {
    isScanning.value = false;
  }
}

async function onDropZoneDrop(event: DragEvent) {
  dragDepth.value = 0;
  isDraggingSaveFolder.value = false;

  const droppedPath = getDroppedPath(event);
  if (!droppedPath) {
    errorMessage.value =
      "Unable to read dropped item. Run `pnpm --dir desktop build:preload`, restart app, and try again.";
    return;
  }

  await scanDroppedFolder(droppedPath);
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
      errorMessage.value = "No Save slot selected.";
      return;
    }

    errorMessage.value = null;
    isImporting.value = true;

    const decodedSave = await window.api.decode(selected.directory);

    if (!decodedSave?.directory) {
      errorMessage.value = "A slot was found, but decoding failed.";
      return;
    }

    setLoadedSave(decodedSave);
    router.push("/editor");
  } catch (error) {
    console.error(error);
    errorMessage.value = "Failed to import Save.";
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
      errorMessage.value = "No ULTRAKILL save slots were found.";
      return;
    }

    const preferredSelection = slots.find(
      (slot) => slot.directory === selectedSlotDirectory.value,
    );
    const defaultSelection =
      preferredSelection ??
      slots.find((slot) => slot.slot.toLowerCase() === "slot1") ??
      slots[0];

    selectedSlotDirectory.value = defaultSelection.directory;
    detectedSaveFolder.value = defaultSelection.directory;
  } catch (error) {
    console.error(error);
    detectedSlots.value = [];
    selectedSlotDirectory.value = null;
    detectedSaveFolder.value = null;
    errorMessage.value = "Failed to scan Save slots.";
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
        <img
          :draggable="false"
          src="/misc/logo.png"
          alt="ULTRAKILL"
          class="h-12 w-auto object-contain"
        />
      </CardHeader>

      <CardContent class="space-y-6">
        <div
          class="rounded-xl border border-dashed p-10 text-center text-sm transition-colors"
          :class="
            isDraggingSaveFolder
              ? 'border-primary bg-primary/10 text-foreground'
              : 'border-border text-muted-foreground'
          "
          @dragenter.prevent="onDropZoneDragEnter"
          @dragover.prevent="onDropZoneDragOver"
          @dragleave.prevent="onDropZoneDragLeave"
          @drop.prevent="onDropZoneDrop"
        >
          <p class="font-medium">
            {{
              isDraggingSaveFolder
                ? "Release to scan folder"
                : "Drop Saves or Slot folder here"
            }}
          </p>
          <p class="mt-2 text-xs text-muted-foreground">
            Dropping <code>Saves</code> with multiple slots lets you pick one
            below.
          </p>
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
              {{
                isScanning ? "Scanning save slots..." : "No save slots loaded."
              }}
            </p>
          </div>

          <div>
            <p class="text-sm font-medium">Save folder</p>
            <p class="break-all text-sm text-muted-foreground">
              {{ detectedSaveFolder ?? "No Save folder loaded." }}
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
          {{ isScanning ? "Scanning..." : "Rescan Slots" }}
        </Button>

        <Button
          @click="importSave"
          :disabled="isImporting || isScanning || !canImport"
        >
          {{ isImporting ? "Importing..." : "Import Save" }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
