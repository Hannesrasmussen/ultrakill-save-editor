export const MAIN_SECTION_ITEMS = [
  {
    id: "missions",
    label: "Missions",
    title: "Missions",
  },
  {
    id: "weapons",
    label: "Weapons",
    title: "Weapons",
  },
  {
    id: "settings",
    label: "Settings",
    title: "Settings",
  },
] as const;

export type MainSection = (typeof MAIN_SECTION_ITEMS)[number]["id"];

export function getMainSectionDescription(
  section: MainSection,
  noJargon: boolean,
) {
  if (section === "missions") {
    return noJargon
      ? "Each difficulty tracks your mission progress separately."
      : "Each difficulty has its own mission progress profile.";
  }

  if (section === "weapons") {
    return noJargon
      ? "Manage weapon unlocks, equipped loadout, and related game progress."
      : "Manage weapon progression flags and customization unlock state.";
  }

  return noJargon
    ? "Change editor options and visibility."
    : "Customize editor behavior, diagnostics, and output visibility.";
}
