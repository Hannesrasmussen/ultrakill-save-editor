export const CONFIRMED_VANILLA_PROGRESS_FILES = [
  "generalprogress.bepis",
  "difficulty*progress.bepis",
  "lvl*progress.bepis",
  "other progression-related .bepis files",
] as const;

export const CONFIRMED_VANILLA_PROGRESS_FIELDS = [
  "money / P",
  "mission progression",
  "mission ranks",
  "secret mission state",
  "weapon and arm unlocks",
  "enemy/unlockable discovery flags",
  "weapon customization unlock flags",
] as const;

export const UNCONFIRMED_OR_OUT_OF_SCOPE_FIELDS = [
  "selected cosmetic color values",
  "skin selection data",
  "external palette files",
  "graphics/options config",
  "mod-specific cosmetic metadata",
] as const;

export const WEAPONS_SCOPE_NOTE =
  "Weapons editing is limited to confirmed vanilla progression flags stored in .bepis save data. Cosmetic appearance selection is treated as separate/unconfirmed data until verified.";
