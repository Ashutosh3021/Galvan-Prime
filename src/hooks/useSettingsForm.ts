import { useState, useCallback, type FormEvent } from 'react';
import type { SettingsFormState } from '../types';

const STORAGE_KEY = 'galvanrag:settings';

const DEFAULT_SETTINGS: SettingsFormState = {
  llmProvider: 'gemini',
  apiKey: '************************',
  vectorDB: 'pinecone',
  envRegion: 'us-east-1-aws',
  indexName: 'galvan-docs-prod',
  hybridWeight: 70,
};

/** Read persisted settings from localStorage, falling back to defaults */
function loadSettings(): SettingsFormState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as SettingsFormState;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * useSettingsForm
 *
 * Shared settings form logic for DesktopSettings and MobileSettings.
 * Persists preferred LLM backend, default chunk strategy, and default
 * collection to localStorage on save.
 */
export function useSettingsForm() {
  const [form, setForm] = useState<SettingsFormState>(loadSettings);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const setField = useCallback(
    <K extends keyof SettingsFormState>(key: K, value: SettingsFormState[K]) => {
      setForm(prev => ({ ...prev, [key]: value }));
    },
    [],
  );

  const toggleShowKey = useCallback(() => {
    setShowKey(v => !v);
  }, []);

  const handleSave = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      try {
        // Persist only the non-sensitive fields — never write the raw API key
        const toSave: Partial<SettingsFormState> = {
          llmProvider: form.llmProvider,
          vectorDB: form.vectorDB,
          envRegion: form.envRegion,
          indexName: form.indexName,
          hybridWeight: form.hybridWeight,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch {
        // localStorage may be unavailable (e.g. private browsing quota)
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    [form],
  );

  const handleReset = useCallback(() => {
    setForm(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { form, showKey, saved, setField, toggleShowKey, handleSave, handleReset };
}
