<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { RouterView } from "vue-router";
import {
  AlertTriangle,
  ChevronDown,
  Minus,
  Square,
  X,
  ZoomIn,
} from "lucide-vue-next";
import {
  appendCliOutput,
  installFrontendConsoleCapture,
} from "@/lib/output-log-store";

const zoomPercent = ref(100);
const isZoomMenuOpen = ref(false);
const isUltrakillRunning = ref(false);
const isUltrakillCheckPending = ref(false);
const updateNotice = ref<{
  currentVersion: string;
  latestVersion: string;
  releaseUrl: string;
} | null>(null);
const isUpdateNoticeDismissed = ref(false);
const zoomMenuRootRef = ref<HTMLElement | null>(null);
const zoomOptions = [70, 80, 90, 100, 110, 125, 150];
const appVersion = __APP_VERSION__;
const ULTRAKILL_CHECK_INTERVAL_MS = 3000;
let removeZoomListener: (() => void) | null = null;
let removeCliOutputListener: (() => void) | null = null;
let removeUpdateListener: (() => void) | null = null;
let ultrakillCheckInterval: number | null = null;

function onDocumentPointerDown(event: PointerEvent) {
  if (!isZoomMenuOpen.value) {
    return;
  }

  const target = zoomMenuRootRef.value;
  if (!target) {
    return;
  }

  const eventTarget = event.target;
  if (eventTarget instanceof Node && target.contains(eventTarget)) {
    return;
  }

  closeZoomMenu();
}

function onDocumentKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closeZoomMenu();
  }
}

function minimize() {
  window.api.minimize();
}

function maximize() {
  window.api.maximize();
}

function close() {
  window.api.close();
}

function openLatestRelease() {
  const url = updateNotice.value?.releaseUrl;
  if (!url) {
    return;
  }

  void window.api.openExternal(url);
}

function dismissUpdateNotice() {
  isUpdateNoticeDismissed.value = true;
}

async function checkUltrakillState() {
  if (isUltrakillCheckPending.value) {
    return;
  }

  isUltrakillCheckPending.value = true;

  try {
    isUltrakillRunning.value = Boolean(await window.api.isUltrakillRunning());
  } catch (error) {
    console.error("Failed to check ULTRAKILL process state:", error);
    isUltrakillRunning.value = false;
  } finally {
    isUltrakillCheckPending.value = false;
  }
}

async function syncZoomFactor() {
  const factor = await window.api.getZoomFactor();
  zoomPercent.value = Math.round(factor * 100);
}

function closeZoomMenu() {
  isZoomMenuOpen.value = false;
}

function toggleZoomMenu() {
  isZoomMenuOpen.value = !isZoomMenuOpen.value;
}

async function setZoomPercent(percent: number) {
  const factor = await window.api.setZoomFactor(percent / 100);
  zoomPercent.value = Math.round(factor * 100);
  closeZoomMenu();
}

async function resetZoom() {
  const factor = await window.api.resetZoomFactor();
  zoomPercent.value = Math.round(factor * 100);
  closeZoomMenu();
}

onMounted(() => {
  installFrontendConsoleCapture();
  removeCliOutputListener = window.api.onCliOutput((payload) => {
    const normalized = payload.text.trim();
    if (!normalized) {
      return;
    }

    appendCliOutput(
      payload.stream === "stderr" ? "warn" : "info",
      `[${payload.command}] ${normalized}`,
      payload.timestamp,
    );
  });
  removeUpdateListener = window.api.onUpdateAvailable((payload) => {
    updateNotice.value = payload;
    isUpdateNoticeDismissed.value = false;
  });
  void syncZoomFactor();
  void checkUltrakillState();
  ultrakillCheckInterval = window.setInterval(() => {
    void checkUltrakillState();
  }, ULTRAKILL_CHECK_INTERVAL_MS);
  removeZoomListener = window.api.onZoomChanged((factor) => {
    zoomPercent.value = Math.round(factor * 100);
  });
  document.addEventListener("pointerdown", onDocumentPointerDown);
  document.addEventListener("keydown", onDocumentKeyDown);
});

onUnmounted(() => {
  removeZoomListener?.();
  removeZoomListener = null;
  removeCliOutputListener?.();
  removeCliOutputListener = null;
  removeUpdateListener?.();
  removeUpdateListener = null;
  if (ultrakillCheckInterval !== null) {
    window.clearInterval(ultrakillCheckInterval);
    ultrakillCheckInterval = null;
  }
  document.removeEventListener("pointerdown", onDocumentPointerDown);
  document.removeEventListener("keydown", onDocumentKeyDown);
});
</script>

<template>
  <div class="relative h-screen bg-background text-foreground">
    <div
      class="flex h-screen flex-col bg-background text-foreground transition duration-300"
      :class="
        isUltrakillRunning
          ? 'pointer-events-none opacity-25 saturate-50'
          : 'opacity-100'
      "
    >
      <header
        class="flex h-10 items-center justify-between border-b px-3 select-none"
        style="-webkit-app-region: drag"
      >
        <div class="text-sm font-semibold">{{ appVersion }}</div>

        <div
          class="flex items-center gap-1"
          style="-webkit-app-region: no-drag"
        >
          <div
            ref="zoomMenuRootRef"
            class="relative"
            style="-webkit-app-region: no-drag"
          >
            <button
              type="button"
              class="flex h-8 cursor-pointer items-center gap-1 rounded px-2 text-xs hover:bg-accent [&::-webkit-details-marker]:hidden"
              :aria-expanded="isZoomMenuOpen"
              aria-haspopup="menu"
              @pointerdown.stop
              @click="toggleZoomMenu"
            >
              <ZoomIn class="h-3.5 w-3.5" />
              <span>{{ zoomPercent }}%</span>
              <ChevronDown
                class="h-3 w-3 transition-transform"
                :class="isZoomMenuOpen ? 'rotate-180' : ''"
              />
            </button>

            <div
              v-if="isZoomMenuOpen"
              class="absolute right-0 top-9 z-50 w-32 rounded-md border bg-popover p-1 text-popover-foreground shadow-lg"
              style="-webkit-app-region: no-drag"
              @pointerdown.stop
            >
              <button
                v-for="percent in zoomOptions"
                :key="percent"
                type="button"
                class="flex w-full items-center justify-between rounded px-2 py-1 text-left text-xs hover:bg-accent"
                @click="setZoomPercent(percent)"
              >
                <span>{{ percent }}%</span>
                <span v-if="zoomPercent === percent">*</span>
              </button>

              <div class="my-1 h-px bg-border" />

              <button
                type="button"
                class="w-full rounded px-2 py-1 text-left text-xs hover:bg-accent"
                @click="resetZoom"
              >
                Reset (100%)
              </button>
            </div>
          </div>

          <button
            class="flex h-8 w-8 items-center justify-center rounded hover:bg-accent"
            @click="minimize"
          >
            <Minus class="h-4 w-4" />
          </button>

          <button
            class="flex h-8 w-8 items-center justify-center rounded hover:bg-accent"
            @click="maximize"
          >
            <Square class="h-3.5 w-3.5" />
          </button>

          <button
            class="flex h-8 w-8 items-center justify-center rounded hover:bg-red-500/80"
            @click="close"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </header>

      <section
        v-if="updateNotice && !isUpdateNoticeDismissed && !isUltrakillRunning"
        class="mx-4 mt-3 animate-pulse rounded-lg border-2 border-amber-400/80 bg-amber-500/15 p-3 shadow-xl"
        style="-webkit-app-region: no-drag"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-amber-200">
              New update available
            </p>
            <p class="mt-1 text-xs text-amber-100/90">
              You are on {{ updateNotice.currentVersion }}. Latest release is
              {{ updateNotice.latestVersion }}.
            </p>
          </div>

          <div class="flex shrink-0 gap-2">
            <button
              type="button"
              class="rounded-md border border-amber-300/80 bg-amber-400/25 px-2.5 py-1.5 text-xs font-medium text-amber-100 hover:bg-amber-400/35"
              @click="openLatestRelease"
            >
              Download latest release
            </button>
            <button
              type="button"
              class="rounded-md border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/15"
              @click="dismissUpdateNotice"
            >
              Dismiss
            </button>
          </div>
        </div>
      </section>

      <main class="flex-1 overflow-auto">
        <RouterView />
      </main>
    </div>

    <div
      v-if="isUltrakillRunning"
      class="absolute inset-0 z-120 flex items-center justify-center bg-black/70 p-6"
    >
      <section
        class="w-full max-w-xl rounded-xl border border-red-500/40 bg-neutral-900/95 p-5 shadow-2xl"
      >
        <div class="mb-3 flex items-start gap-3">
          <div
            class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-300"
          >
            <AlertTriangle class="h-4 w-4" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-red-200">
              ULTRAKILL is open
            </h2>
            <p class="mt-1 text-sm text-white/85">
              Close ULTRAKILL and restart the save editor before making changes.
              Running both at once can lock save files and prevent reliable
              writes.
            </p>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/15 disabled:cursor-wait disabled:opacity-70"
            :disabled="isUltrakillCheckPending"
            @click="checkUltrakillState"
          >
            {{
              isUltrakillCheckPending
                ? "Checking..."
                : "I closed ULTRAKILL (Recheck)"
            }}
          </button>
          <button
            type="button"
            class="rounded-md border border-red-500/50 bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-100 hover:bg-red-500/30"
            @click="close"
          >
            Close Save Editor
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
