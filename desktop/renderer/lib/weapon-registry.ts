export type WeaponFamilyType = "weapon" | "arm";
export type WeaponVariantColor =
  | "blue"
  | "green"
  | "red"
  | "alternate"
  | "special";

export interface WeaponRegistryItem {
  id: string;
  family: string;
  type: WeaponFamilyType;
  displayName: string;
  variantName: string;
  // "color" identifies vanilla weapon slot/channel (blue/green/red/etc), not paint data.
  color: WeaponVariantColor;
  saveField: string;
  isAlternate?: boolean;
  isCustomizationField?: boolean;
}

export interface WeaponFamilyDefinition {
  id: string;
  displayName: string;
  type: WeaponFamilyType;
  items: WeaponRegistryItem[];
  customizationField?: string;
}

export const WEAPON_FAMILIES: WeaponFamilyDefinition[] = [
  {
    id: "revolver",
    displayName: "Revolver",
    type: "weapon",
    customizationField: "revCustomizationUnlocked",
    items: [
      {
        id: "revolver-blue",
        family: "revolver",
        type: "weapon",
        displayName: "Revolver",
        variantName: "Piercer",
        color: "blue",
        saveField: "rev0",
      },
      {
        id: "revolver-green",
        family: "revolver",
        type: "weapon",
        displayName: "Revolver",
        variantName: "Marksman",
        color: "green",
        saveField: "rev1",
      },
      {
        id: "revolver-red",
        family: "revolver",
        type: "weapon",
        displayName: "Revolver",
        variantName: "Sharpshooter",
        color: "red",
        saveField: "rev2",
      },
      {
        id: "revolver-alt",
        family: "revolver",
        type: "weapon",
        displayName: "Alternate Revolver",
        variantName: "Alternate",
        color: "alternate",
        saveField: "revalt",
        isAlternate: true,
      },
    ],
  },
  {
    id: "shotgun",
    displayName: "Shotgun",
    type: "weapon",
    customizationField: "shoCustomizationUnlocked",
    items: [
      {
        id: "shotgun-blue",
        family: "shotgun",
        type: "weapon",
        displayName: "Shotgun",
        variantName: "Core Eject",
        color: "blue",
        saveField: "sho0",
      },
      {
        id: "shotgun-green",
        family: "shotgun",
        type: "weapon",
        displayName: "Shotgun",
        variantName: "Pump Charge",
        color: "green",
        saveField: "sho1",
      },
      {
        id: "shotgun-red",
        family: "shotgun",
        type: "weapon",
        displayName: "Shotgun",
        variantName: "Sawed-On",
        color: "red",
        saveField: "sho2",
      },
      {
        id: "shotgun-alt",
        family: "shotgun",
        type: "weapon",
        displayName: "Alternate Shotgun",
        variantName: "Alternate",
        color: "alternate",
        saveField: "shoalt",
        isAlternate: true,
      },
    ],
  },
  {
    id: "nailgun",
    displayName: "Nailgun",
    type: "weapon",
    customizationField: "naiCustomizationUnlocked",
    items: [
      {
        id: "nailgun-blue",
        family: "nailgun",
        type: "weapon",
        displayName: "Nailgun",
        variantName: "Attractor",
        color: "blue",
        saveField: "nai0",
      },
      {
        id: "nailgun-green",
        family: "nailgun",
        type: "weapon",
        displayName: "Nailgun",
        variantName: "Overheat",
        color: "green",
        saveField: "nai1",
      },
      {
        id: "nailgun-red",
        family: "nailgun",
        type: "weapon",
        displayName: "Nailgun",
        variantName: "JumpStart",
        color: "red",
        saveField: "nai2",
      },
      {
        id: "nailgun-alt",
        family: "nailgun",
        type: "weapon",
        displayName: "Alternate Nailgun",
        variantName: "Alternate",
        color: "alternate",
        saveField: "naialt",
        isAlternate: true,
      },
    ],
  },
  {
    id: "railcannon",
    displayName: "Railcannon",
    type: "weapon",
    customizationField: "raiCustomizationUnlocked",
    items: [
      {
        id: "railcannon-blue",
        family: "railcannon",
        type: "weapon",
        displayName: "Railcannon",
        variantName: "Electric",
        color: "blue",
        saveField: "rai0",
      },
      {
        id: "railcannon-green",
        family: "railcannon",
        type: "weapon",
        displayName: "Railcannon",
        variantName: "Screwdriver",
        color: "green",
        saveField: "rai1",
      },
      {
        id: "railcannon-red",
        family: "railcannon",
        type: "weapon",
        displayName: "Railcannon",
        variantName: "Malicious",
        color: "red",
        saveField: "rai2",
      },
    ],
  },
  {
    id: "rocket-launcher",
    displayName: "Rocket Launcher",
    type: "weapon",
    customizationField: "rockCustomizationUnlocked",
    items: [
      {
        id: "rocket-launcher-blue",
        family: "rocket-launcher",
        type: "weapon",
        displayName: "Rocket Launcher",
        variantName: "Freezeframe",
        color: "blue",
        saveField: "rock0",
      },
      {
        id: "rocket-launcher-green",
        family: "rocket-launcher",
        type: "weapon",
        displayName: "Rocket Launcher",
        variantName: "SRS Cannon",
        color: "green",
        saveField: "rock1",
      },
      {
        id: "rocket-launcher-red",
        family: "rocket-launcher",
        type: "weapon",
        displayName: "Rocket Launcher",
        variantName: "Firestarter",
        color: "red",
        saveField: "rock2",
      },
    ],
  },
  {
    id: "arms",
    displayName: "Arms",
    type: "arm",
    items: [
      {
        id: "arm-feedbacker",
        family: "arms",
        type: "arm",
        displayName: "Arm",
        variantName: "Feedbacker",
        color: "special",
        saveField: "arm1",
      },
      {
        id: "arm-knuckleblaster",
        family: "arms",
        type: "arm",
        displayName: "Arm",
        variantName: "Knuckleblaster",
        color: "special",
        saveField: "arm2",
      },
      {
        id: "arm-whiplash",
        family: "arms",
        type: "arm",
        displayName: "Arm",
        variantName: "Whiplash",
        color: "special",
        saveField: "arm3",
      },
    ],
  },
];

export const EXTRA_WEAPON_FIELDS = [
  {
    id: "beam0",
    displayName: "Beam 0",
    saveField: "beam0",
  },
  {
    id: "beam1",
    displayName: "Beam 1",
    saveField: "beam1",
  },
  {
    id: "beam2",
    displayName: "Beam 2",
    saveField: "beam2",
  },
  {
    id: "beam3",
    displayName: "Beam 3",
    saveField: "beam3",
  },
] as const;

const WEAPON_ICON_BY_SAVE_FIELD: Record<string, string> = {
  rev0: "/weapon-icons/revolver/piercer/piercer.png",
  rev1: "/weapon-icons/revolver/marksman/marksman.png",
  rev2: "/weapon-icons/revolver/sharpshooter/sharpshooter.png",
  revalt: "/weapon-icons/revolver/piercer/piercer_alt.png",
  sho0: "/weapon-icons/shotgun/core-eject/core-eject.png",
  sho1: "/weapon-icons/shotgun/pump-charge/pump-charge.png",
  sho2: "/weapon-icons/shotgun/sawed-on/sawed-on.png",
  shoalt: "/weapon-icons/shotgun/core-eject/core-eject_alt.png",
  nai0: "/weapon-icons/nailgun/attractor/attractor.png",
  nai1: "/weapon-icons/nailgun/overheat/overheat.png",
  nai2: "/weapon-icons/nailgun/jumpstart/jumpstart.png",
  naialt: "/weapon-icons/nailgun/attractor/attractor_alt.png",
  rai0: "/weapon-icons/railcannon/electric.png",
  rai1: "/weapon-icons/railcannon/screwdriver.png",
  rai2: "/weapon-icons/railcannon/malicious.png",
  rock0: "/weapon-icons/rocket_launcher/freezeframe.png",
  rock1: "/weapon-icons/rocket_launcher/srs_cannon.png",
  rock2: "/weapon-icons/rocket_launcher/firestarter.png",
  arm1: "/weapon-icons/arm/feedbacker.png",
  arm2: "/weapon-icons/arm/knuckleblaster.png",
  arm3: "/weapon-icons/arm/whiplash.png",
};

const WEAPON_ALT_ICON_BY_SAVE_FIELD: Record<string, string> = {
  rev0: "/weapon-icons/revolver/piercer/piercer_alt.png",
  rev1: "/weapon-icons/revolver/marksman/marksman_alt.png",
  rev2: "/weapon-icons/revolver/sharpshooter/sharpshooter_alt.png",
  sho0: "/weapon-icons/shotgun/core-eject/core-eject_alt.png",
  sho1: "/weapon-icons/shotgun/pump-charge/pump-charge_alt.png",
  sho2: "/weapon-icons/shotgun/sawed-on/sawed-on_alt.png",
  nai0: "/weapon-icons/nailgun/attractor/attractor_alt.png",
  nai1: "/weapon-icons/nailgun/overheat/overheat_alt.png",
  nai2: "/weapon-icons/nailgun/jumpstart/jumpstart_alt.png",
};

export function getWeaponFamilyById(id: string) {
  return WEAPON_FAMILIES.find((family) => family.id === id) ?? null;
}

export function getAllWeaponFamilies() {
  return WEAPON_FAMILIES;
}

export function getWeaponItemBySaveField(saveField: string) {
  for (const family of WEAPON_FAMILIES) {
    const item = family.items.find((entry) => entry.saveField === saveField);

    if (item) {
      return item;
    }
  }

  return null;
}

export function getWeaponIconPath(saveField: string, useAlternate = false) {
  if (useAlternate) {
    return (
      WEAPON_ALT_ICON_BY_SAVE_FIELD[saveField] ??
      WEAPON_ICON_BY_SAVE_FIELD[saveField] ??
      null
    );
  }

  return WEAPON_ICON_BY_SAVE_FIELD[saveField] ?? null;
}

export function getCustomizationFields() {
  return WEAPON_FAMILIES.map((family) => family.customizationField).filter(
    (field): field is string => Boolean(field),
  );
}

export function isWeaponSaveField(saveField: string) {
  return (
    getWeaponItemBySaveField(saveField) !== null ||
    getCustomizationFields().includes(saveField) ||
    EXTRA_WEAPON_FIELDS.some((field) => field.saveField === saveField)
  );
}
