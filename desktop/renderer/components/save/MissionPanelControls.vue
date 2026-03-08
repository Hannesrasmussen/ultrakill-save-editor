<script setup lang="ts">
import { computed } from "vue";

import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from "@/components";
import {
  Layers,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Zap,
} from "lucide-vue-next";
import type { DifficultyDefinition } from "@/lib/difficulty-registry";
import type {
  MissionTypeFilter,
  PresenceFilter,
  QuickMissionRank,
} from "@/components/save/mission-panel-types";
import { getQuickRankButtonClass } from "@/components/save/rank-button-styles";

const props = defineProps<{
  difficulties: DifficultyDefinition[];
  selectedDifficultyId: number;
  searchQuery: string;
  typeFilter: MissionTypeFilter;
  presenceFilter: PresenceFilter;
  visibleMissionCount: number;
  missingMissionCount: number;
  modifiedMissionCount: number;
}>();

const emit = defineEmits<{
  "update:search-query": [value: string];
  "update:selected-difficulty-id": [value: number];
  "update:type-filter": [value: MissionTypeFilter];
  "update:presence-filter": [value: PresenceFilter];
  "quick-action:complete-all-missions": [];
  "quick-action:set-all-ranks": [value: QuickMissionRank];
  "quick-action:set-all-secrets": [value: boolean];
  "quick-action:set-all-challenges": [value: boolean];
}>();

const selectedDifficultyName = computed(() => {
  return (
    props.difficulties.find(
      (difficulty) => difficulty.id === props.selectedDifficultyId,
    )?.name ?? "Unknown"
  );
});

function onDifficultyChange(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return;
  }

  const parsed = Number(String(value));
  if (Number.isNaN(parsed)) {
    return;
  }

  emit("update:selected-difficulty-id", parsed);
}

function onTypeFilterChange(value: MissionTypeFilter) {
  emit("update:type-filter", value);
}

function onPresenceFilterChange(value: PresenceFilter) {
  emit("update:presence-filter", value);
}

function setAllRanks(value: QuickMissionRank) {
  emit("quick-action:set-all-ranks", value);
}

function setAllSecrets(value: boolean) {
  emit("quick-action:set-all-secrets", value);
}
</script>

<template>
  <div class="space-y-4">
    <Card>
      <CardHeader class="space-y-4">
        <div
          class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"
        >
          <div>
            <CardTitle>Missions</CardTitle>
            <CardDescription class="mt-1 text-sm">
              Browse known missions, search quickly, and edit progress even when
              a local .bepis file does not exist yet.
            </CardDescription>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {{ props.visibleMissionCount }} visible
            </Badge>

            <Badge variant="outline">
              {{ props.missingMissionCount }} missing files
            </Badge>

            <Badge v-if="props.modifiedMissionCount" variant="secondary">
              {{ props.modifiedMissionCount }} modified
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent class="space-y-5">
        <div
          class="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-sm"
        >
          <div
            class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"
          >
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <ShieldAlert class="h-4 w-4 text-amber-600" />
                <p class="font-medium">Difficulty Scope</p>
                <Badge variant="outline" class="border-amber-500/50">
                  <Layers class="mr-1 h-3.5 w-3.5" />
                  {{ selectedDifficultyName }}
                </Badge>
              </div>

              <p class="mt-2 text-muted-foreground">
                Mission completion is tracked separately per difficulty. Mission
                edits and Quick Actions apply only to
                <span class="font-medium text-foreground">{{
                  selectedDifficultyName
                }}</span
                >.
              </p>
            </div>

            <div
              class="w-full max-w-xs rounded-md border border-amber-500/50 bg-background/50 p-3"
            >
              <label class="text-sm font-medium">Selected difficulty</label>
              <Select
                :model-value="String(props.selectedDifficultyId)"
                @update:model-value="onDifficultyChange"
              >
                <SelectTrigger
                  class="mt-2 w-full"
                  aria-label="Selected difficulty"
                >
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem
                    v-for="difficulty in props.difficulties"
                    :key="difficulty.id"
                    :value="String(difficulty.id)"
                  >
                    {{ difficulty.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div
          class="space-y-3 rounded-lg border border-border/80 bg-card/30 p-4"
        >
          <div class="flex items-center gap-2">
            <Zap class="h-4 w-4 text-amber-500" />
            <p class="text-sm font-medium">Quick Actions</p>
          </div>

          <div>
            <p class="mb-2 text-xs text-muted-foreground">
              Bulk completion sets secrets and challenges, but does not change
              mission rank.
            </p>

            <div class="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                @click="emit('quick-action:complete-all-missions')"
              >
                Complete all secrets + challenges
              </Button>
            </div>
          </div>

          <div>
            <p class="mb-2 text-sm font-medium">Set rank for all missions</p>

            <div class="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                :class="getQuickRankButtonClass('D')"
                @click="setAllRanks('D')"
              >
                D
              </Button>
              <Button
                size="sm"
                variant="outline"
                :class="getQuickRankButtonClass('C')"
                @click="setAllRanks('C')"
              >
                C
              </Button>
              <Button
                size="sm"
                variant="outline"
                :class="getQuickRankButtonClass('B')"
                @click="setAllRanks('B')"
              >
                B
              </Button>
              <Button
                size="sm"
                variant="outline"
                :class="getQuickRankButtonClass('A')"
                @click="setAllRanks('A')"
              >
                A
              </Button>
              <!-- All S rank is just P rank. So no need for it.-->
              <Button
                size="sm"
                variant="outline"
                :class="getQuickRankButtonClass('P')"
                @click="setAllRanks('P')"
              >
                P
              </Button>
            </div>
          </div>

          <div>
            <p class="mb-2 text-sm font-medium">Secrets</p>

            <div class="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" @click="setAllSecrets(true)">
                Fill all
              </Button>
              <Button size="sm" variant="outline" @click="setAllSecrets(false)">
                Clear all
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="space-y-4 pt-6">
        <div class="flex items-center gap-2">
          <Search class="h-4 w-4 text-muted-foreground" />
          <SlidersHorizontal class="h-4 w-4 text-muted-foreground" />
          <p class="text-sm font-medium">Search & Filters</p>
        </div>

        <div class="space-y-2">
          <label for="mission-search" class="text-sm font-medium">
            Search missions
          </label>

          <div class="relative">
            <Search
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="mission-search"
              class="h-10 border-border/80 bg-background/70 pl-9"
              :model-value="props.searchQuery"
              type="text"
              placeholder="Search by mission code, name, group, or file..."
              @update:model-value="emit('update:search-query', String($event))"
            />
          </div>
        </div>

        <Separator />

        <div class="space-y-3">
          <div>
            <p class="mb-2 text-sm font-medium">Type</p>

            <div class="flex flex-wrap gap-2">
              <Button
                size="sm"
                :variant="props.typeFilter === 'all' ? 'secondary' : 'outline'"
                @click="onTypeFilterChange('all')"
              >
                All
              </Button>

              <Button
                size="sm"
                :variant="
                  props.typeFilter === 'primary' ? 'secondary' : 'outline'
                "
                @click="onTypeFilterChange('primary')"
              >
                Primary
              </Button>

              <Button
                size="sm"
                :variant="
                  props.typeFilter === 'encore' ? 'secondary' : 'outline'
                "
                @click="onTypeFilterChange('encore')"
              >
                Encore
              </Button>

              <Button
                size="sm"
                :variant="
                  props.typeFilter === 'prime' ? 'secondary' : 'outline'
                "
                @click="onTypeFilterChange('prime')"
              >
                Prime
              </Button>

              <Button
                size="sm"
                :variant="
                  props.typeFilter === 'secret' ? 'secondary' : 'outline'
                "
                @click="onTypeFilterChange('secret')"
              >
                Secret
              </Button>

              <Button
                size="sm"
                :variant="
                  props.typeFilter === 'unknown' ? 'secondary' : 'outline'
                "
                @click="onTypeFilterChange('unknown')"
              >
                Unknown
              </Button>
            </div>
          </div>

          <div>
            <p class="mb-2 text-sm font-medium">Presence</p>

            <div class="flex flex-wrap gap-2">
              <Button
                size="sm"
                :variant="
                  props.presenceFilter === 'all' ? 'secondary' : 'outline'
                "
                @click="onPresenceFilterChange('all')"
              >
                All
              </Button>

              <Button
                size="sm"
                :variant="
                  props.presenceFilter === 'present' ? 'secondary' : 'outline'
                "
                @click="onPresenceFilterChange('present')"
              >
                File present
              </Button>

              <Button
                size="sm"
                :variant="
                  props.presenceFilter === 'missing' ? 'secondary' : 'outline'
                "
                @click="onPresenceFilterChange('missing')"
              >
                File missing
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
