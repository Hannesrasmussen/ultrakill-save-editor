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
  Separator,
} from "@/components";
import { saveValidation } from "@/lib/app-state";
import { ALL_DIFFICULTIES_LABEL } from "@/lib/difficulty-registry";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  ShieldX,
} from "lucide-vue-next";

const props = defineProps<{
  selectedDifficultyName?: string;
  expanded?: boolean;
  noJargon?: boolean;
}>();
const emit = defineEmits<{
  "update:expanded": [value: boolean];
}>();

const validation = computed(() => saveValidation.value);
const isExpanded = computed(() => props.expanded ?? true);
const noJargon = computed(() => props.noJargon === true);
const isAllDifficulties = computed(
  () => props.selectedDifficultyName === ALL_DIFFICULTIES_LABEL,
);

const label = computed(() => {
  switch (validation.value?.health) {
    case "healthy":
      return "Healthy";
    case "warning":
      return "Warning";
    case "invalid":
      return "Invalid";
    default:
      return "Unknown";
  }
});

const healthBadgeVariant = computed<
  "default" | "secondary" | "destructive" | "outline"
>(() => {
  switch (validation.value?.health) {
    case "healthy":
      return "default";
    case "warning":
      return "secondary";
    case "invalid":
      return "destructive";
    default:
      return "outline";
  }
});

const healthIcon = computed(() => {
  switch (validation.value?.health) {
    case "healthy":
      return CheckCircle2;
    case "warning":
      return AlertTriangle;
    case "invalid":
      return ShieldX;
    default:
      return AlertTriangle;
  }
});
</script>

<template>
  <Card>
    <CardHeader class="space-y-1">
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-1">
          <CardTitle>Save Status</CardTitle>
          <CardDescription>
            {{
              noJargon
                ? "Quick health check and active mission difficulty."
                : "Validation summary and active mission progress profile."
            }}
          </CardDescription>
        </div>

        <Button
          variant="outline"
          size="sm"
          class="shrink-0"
          @click="emit('update:expanded', !isExpanded)"
        >
          <component
            :is="isExpanded ? ChevronUp : ChevronDown"
            class="h-4 w-4"
          />
          {{ isExpanded ? "Collapse" : "Expand" }}
        </Button>
      </div>
    </CardHeader>

    <CardContent v-if="validation && isExpanded" class="space-y-3">
      <div class="grid gap-3 lg:grid-cols-2">
        <div class="rounded-lg border p-3">
          <div class="flex items-center justify-between gap-2">
            <div class="inline-flex items-center gap-2">
              <component
                :is="healthIcon"
                class="h-4 w-4 text-muted-foreground"
              />
              <p class="text-sm font-medium">
                {{ noJargon ? "Save health" : "Validation" }}
              </p>
            </div>

            <Badge :variant="healthBadgeVariant">{{ label }}</Badge>
          </div>

          <p class="mt-2 text-sm text-muted-foreground">
            {{
              noJargon
                ? `${validation.summary.errorCount} serious issue(s), ${validation.summary.warningCount} warning(s)`
                : `${validation.summary.errorCount} errors, ${validation.summary.warningCount} warnings`
            }}
          </p>
        </div>

        <div class="rounded-lg border p-3">
          <div class="flex items-center justify-between gap-2">
            <div class="inline-flex items-center gap-2">
              <Layers class="h-4 w-4 text-muted-foreground" />
              <p class="text-sm font-medium">Mission profile</p>
            </div>

            <Badge variant="outline">
              {{ props.selectedDifficultyName ?? "Unknown" }}
            </Badge>
          </div>

          <p class="mt-2 text-sm text-muted-foreground">
            <span v-if="isAllDifficulties">
              {{
                noJargon
                  ? "Edits in this view affect every difficulty profile at once."
                  : "Edits in this view are applied across all difficulty profiles."
              }}
            </span>
            <span v-else>
              {{
                noJargon
                  ? "Mission progress is separate per difficulty. Switching difficulty changes the data you are editing."
                  : "Mission progress is stored per difficulty. Switching difficulty changes which mission profile you are editing."
              }}
            </span>
          </p>
        </div>
      </div>

      <Separator />

      <ul v-if="validation.issues.length && !noJargon" class="space-y-2 text-sm">
        <li
          v-for="issue in validation.issues.slice(0, 6)"
          :key="`${issue.code}-${issue.file ?? ''}-${issue.field ?? ''}`"
          class="rounded-md border p-2"
        >
          <div class="flex items-center gap-2">
            <Badge
              :variant="
                issue.severity === 'error' ? 'destructive' : 'secondary'
              "
            >
              {{ issue.severity === "error" ? "Error" : "Warning" }}
            </Badge>
            <span class="text-muted-foreground">
              {{ issue.message }}
            </span>
          </div>
        </li>
      </ul>

      <p
        v-else-if="validation.issues.length && noJargon"
        class="text-sm text-muted-foreground"
      >
        Issues were found. Turn off No jargon mode to see technical details.
      </p>

      <p v-else class="text-sm text-muted-foreground">
        {{
          noJargon ? "No issues detected." : "No structural issues detected."
        }}
      </p>
    </CardContent>
  </Card>
</template>
