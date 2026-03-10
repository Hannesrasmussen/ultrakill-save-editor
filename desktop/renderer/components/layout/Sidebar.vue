<script setup lang="ts">
import { Badge, Button } from "@/components";
import { MAIN_SECTION_ITEMS, type MainSection } from "@/lib/main-sections";

const props = defineProps<{
  activeSection: MainSection;
  hasUnsavedChanges: boolean;
  modifiedEntryCount: number;
  loadedSaveFolder: string;
}>();

const emit = defineEmits<{
  "update:active-section": [value: MainSection];
}>();

function setActiveSection(value: MainSection) {
  emit("update:active-section", value);
}
</script>

<template>
  <aside class="flex h-full w-72 flex-col border-r">
    <div class="flex h-full flex-col p-4">
      <div class="m-6">
        <img
          src="/misc/logo.png"
          alt="ULTRAKILL"
          class="mb-4 h-12 w-auto object-contain"
        />

        <div class="mb-3 flex justify-end">
          <Badge v-if="props.hasUnsavedChanges" variant="secondary">
            {{ props.modifiedEntryCount }} unsaved
          </Badge>
        </div>

        <div class="h-px bg-border" />
      </div>

      <nav class="space-y-2">
        <Button
          v-for="section in MAIN_SECTION_ITEMS"
          :key="section.id"
          :variant="props.activeSection === section.id ? 'secondary' : 'ghost'"
          class="w-full justify-start"
          @click="setActiveSection(section.id)"
        >
          {{ section.label }}
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

      <div class="mt-auto space-y-2 rounded-lg border p-3">
        <p
          class="text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          Project Links
        </p>
        <p class="text-xs text-muted-foreground">Temporarily disabled.</p>

        <Button variant="outline" class="w-full justify-start" disabled>
          GitHub Repository
        </Button>

        <Button variant="outline" class="w-full justify-start" disabled>
          Report Issue
        </Button>

        <Button variant="outline" class="w-full justify-start" disabled>
          Releases
        </Button>
      </div>
    </div>
  </aside>
</template>
