import { createDemoData } from '../data/seed';
import { generateWeeklyBriefing } from './briefing';
import type { AppData } from '../types';

export const STORAGE_KEY = 'familyos:data:v1';

export function withFreshBriefing(data: AppData, version = data.briefing.version): AppData {
  return {
    ...data,
    briefing: generateWeeklyBriefing(data, version)
  };
}

export function createSeededData(setupComplete = true): AppData {
  return withFreshBriefing(createDemoData(setupComplete), 1);
}

export function loadAppData(): AppData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeededData(false);
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed.household || !Array.isArray(parsed.transactions)) {
      return createSeededData(false);
    }
    return parsed;
  } catch {
    return createSeededData(false);
  }
}

export function saveAppData(data: AppData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function downloadJson(data: AppData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `familyos-export-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function parseImportedData(text: string): AppData {
  const parsed = JSON.parse(text) as AppData;
  if (!parsed.household || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.goals)) {
    throw new Error('This file does not look like a FamilyOS export.');
  }
  return withFreshBriefing(parsed, (parsed.briefing?.version ?? 0) + 1);
}
