<script setup lang="ts">
import { computed } from "vue";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "@/components";
import { saveValidation } from "@/lib/app-state";
import { AlertTriangle, CheckCircle2, Layers, ShieldX } from "lucide-vue-next";

const props = defineProps<{
  selectedDifficultyName?: string;
}>();

const validation = computed(() => saveValidation.value);

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
      <CardTitle>Save Status</CardTitle>
      <CardDescription>
        Validation summary and active mission progress profile.
      </CardDescription>
    </CardHeader>

    <CardContent v-if="validation" class="space-y-3">
      <div class="grid gap-3 lg:grid-cols-2">
        <div class="rounded-lg border p-3">
          <div class="flex items-center justify-between gap-2">
            <div class="inline-flex items-center gap-2">
              <component
                :is="healthIcon"
                class="h-4 w-4 text-muted-foreground"
              />
              <p class="text-sm font-medium">Validation</p>
            </div>

            <Badge :variant="healthBadgeVariant">{{ label }}</Badge>
          </div>

          <p class="mt-2 text-sm text-muted-foreground">
            {{ validation.summary.errorCount }} errors,
            {{ validation.summary.warningCount }} warnings
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
            Mission progress is stored per difficulty. Switching difficulty
            changes which mission profile you are editing.
          </p>
        </div>
      </div>

      <Separator />

      <ul v-if="validation.issues.length" class="space-y-2 text-sm">
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

      <p v-else class="text-sm text-muted-foreground">
        No structural issues detected.
      </p>
    </CardContent>
  </Card>
</template>
