<script setup lang="ts">
import { computed } from "vue";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ScrollArea,
  Switch,
} from "@/components";
import {
  editorSettings,
  getDefaultEditorSettings,
  updateEditorSettings,
} from "@/lib/editor-settings";
import {
  clearOutputLogs,
  cliOutputEntries,
  frontendOutputEntries,
  type OutputLogEntry,
} from "@/lib/output-log-store";

const settings = computed(() => editorSettings.value);
const defaultSettings = getDefaultEditorSettings();

const frontendLogs = computed(() => [...frontendOutputEntries.value].reverse());
const cliLogs = computed(() => [...cliOutputEntries.value].reverse());

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString();
}

function getLogVariant(entry: OutputLogEntry) {
  if (entry.level === "error") {
    return "destructive";
  }

  if (entry.level === "warn") {
    return "secondary";
  }

  return "outline";
}
</script>

<template>
  <div class="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Customize editor behavior and visible tools.
        </CardDescription>
      </CardHeader>

      <CardContent class="space-y-4">
        <div class="flex items-center justify-between rounded-md border p-3">
          <div>
            <p class="font-medium">Show Save Status (Dev flag)</p>
            <p class="text-sm text-muted-foreground">
              Shows technical save diagnostics at the top of editor tabs.
            </p>
          </div>
          <Switch
            :model-value="settings.showSaveStatus"
            @update:model-value="
              updateEditorSettings({ showSaveStatus: $event === true })
            "
          />
        </div>

        <div class="flex items-center justify-between rounded-md border p-3">
          <div>
            <p class="font-medium">Show CLI + frontend output</p>
            <p class="text-sm text-muted-foreground">
              Displays runtime logs below this settings card.
            </p>
          </div>
          <Switch
            :model-value="settings.showOutput"
            @update:model-value="
              updateEditorSettings({ showOutput: $event === true })
            "
          />
        </div>

        <div class="flex items-center justify-between rounded-md border p-3">
          <div>
            <p class="font-medium">No jargon mode</p>
            <p class="text-sm text-muted-foreground">
              Uses plain game terms and hides file/format internals where
              possible.
            </p>
          </div>
          <Switch
            :model-value="settings.noJargon"
            @update:model-value="
              updateEditorSettings({ noJargon: $event === true })
            "
          />
        </div>

        <div class="flex justify-end">
          <Button
            variant="outline"
            @click="updateEditorSettings(defaultSettings)"
          >
            Reset defaults
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card v-if="settings.showOutput">
      <CardHeader>
        <CardTitle>Runtime Output</CardTitle>
        <CardDescription>
          Live frontend console logs and CLI stdout/stderr stream.
        </CardDescription>
      </CardHeader>

      <CardContent class="space-y-4">
        <div class="grid gap-4 lg:grid-cols-2">
          <div class="rounded-md border p-3">
            <div class="mb-2 flex items-center justify-between">
              <p class="font-medium">Frontend output</p>
              <Badge variant="outline">{{ frontendLogs.length }} entries</Badge>
            </div>
            <ScrollArea class="h-56 rounded border p-2">
              <div class="space-y-2">
                <p
                  v-if="!frontendLogs.length"
                  class="text-sm text-muted-foreground"
                >
                  No frontend logs yet.
                </p>

                <div
                  v-for="entry in frontendLogs"
                  :key="entry.id"
                  class="rounded border p-2"
                >
                  <div class="mb-1 flex items-center justify-between gap-2">
                    <Badge :variant="getLogVariant(entry)">
                      {{ entry.level }}
                    </Badge>
                    <span class="text-xs text-muted-foreground">
                      {{ formatTimestamp(entry.timestamp) }}
                    </span>
                  </div>
                  <p class="break-words text-xs font-mono">{{ entry.text }}</p>
                </div>
              </div>
            </ScrollArea>
          </div>

          <div class="rounded-md border p-3">
            <div class="mb-2 flex items-center justify-between">
              <p class="font-medium">CLI output</p>
              <Badge variant="outline">{{ cliLogs.length }} entries</Badge>
            </div>
            <ScrollArea class="h-56 rounded border p-2">
              <div class="space-y-2">
                <p v-if="!cliLogs.length" class="text-sm text-muted-foreground">
                  No CLI logs yet.
                </p>

                <div
                  v-for="entry in cliLogs"
                  :key="entry.id"
                  class="rounded border p-2"
                >
                  <div class="mb-1 flex items-center justify-between gap-2">
                    <Badge :variant="getLogVariant(entry)">
                      {{ entry.level }}
                    </Badge>
                    <span class="text-xs text-muted-foreground">
                      {{ formatTimestamp(entry.timestamp) }}
                    </span>
                  </div>
                  <p class="break-words text-xs font-mono">{{ entry.text }}</p>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        <div class="flex justify-end">
          <Button variant="outline" @click="clearOutputLogs">
            Clear output logs
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
