const SUPPORTED_IMAGE_EXTENSIONS = ["png", "webp", "jpg", "jpeg"] as const;

function toMissionScreenshotSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9-]/g, "");
}

export function getMissionScreenshotCandidates(code: string): string[] {
  const normalized = toMissionScreenshotSlug(code);

  if (!normalized) {
    return [];
  }

  const baseNames = [normalized];
  const candidates: string[] = [];

  for (const baseName of baseNames) {
    for (const extension of SUPPORTED_IMAGE_EXTENSIONS) {
      candidates.push(`/mission-screenshots/${baseName}.${extension}`);
    }
  }

  return candidates;
}
