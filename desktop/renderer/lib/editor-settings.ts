import { ref, watch } from "vue";

export interface EditorSettings {
  showSaveStatus: boolean;
  showOutput: boolean;
  noJargon: boolean;
}

const SETTINGS_STORAGE_KEY = "ultrakill-save-editor-settings-v1";

const defaultEditorSettings: EditorSettings = {
  showSaveStatus: false,
  showOutput: false,
  noJargon: false,
};

function normalizeSettings(value: unknown): EditorSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...defaultEditorSettings };
  }

  const record = value as Record<string, unknown>;
  return {
    showSaveStatus:
      typeof record.showSaveStatus === "boolean"
        ? record.showSaveStatus
        : defaultEditorSettings.showSaveStatus,
    showOutput:
      typeof record.showOutput === "boolean"
        ? record.showOutput
        : defaultEditorSettings.showOutput,
    noJargon:
      typeof record.noJargon === "boolean"
        ? record.noJargon
        : defaultEditorSettings.noJargon,
  };
}

function loadSettings(): EditorSettings {
  if (typeof window === "undefined") {
    return { ...defaultEditorSettings };
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return { ...defaultEditorSettings };
    }

    return normalizeSettings(JSON.parse(raw));
  } catch {
    return { ...defaultEditorSettings };
  }
}

function persistSettings(settings: EditorSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

function applyEditorTheme() {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.add("dark");
  root.style.colorScheme = "dark";
}

export const editorSettings = ref<EditorSettings>(loadSettings());

watch(
  editorSettings,
  (next) => {
    persistSettings(next);
    applyEditorTheme();
  },
  { deep: true, immediate: true },
);

export function updateEditorSettings(patch: Partial<EditorSettings>) {
  editorSettings.value = normalizeSettings({
    ...editorSettings.value,
    ...patch,
  });
}

export function resetEditorSettings() {
  editorSettings.value = { ...defaultEditorSettings };
}

export function getDefaultEditorSettings() {
  return { ...defaultEditorSettings };
}
