import { useState, useCallback, useEffect, type FormEvent } from 'react';
import { getSettings, updateSettings } from '../api/settings';
import type { SettingsFormState } from '../types';

const STORAGE_KEY = 'galvanrag:settings';

const DEFAULT_SETTINGS: SettingsFormState = {
  llmProvider: 'gemini',
  apiKey: '',
  vectorDB: 'pinecone',
  envRegion: 'us-east-1-aws',
  indexName: 'galvan-docs-prod',
  hybridWeight: 70,
};

/**
 * useSettingsForm
 *
 * Shared settings form logic for DesktopSettings and MobileSettings.
 * Loads the active LLM provider from the backend on mount and persists
 * provider changes via POST /settings. Non-backend fields (API key, vector
 * DB, region, index, hybrid weight) remain localStorage-only for UI continuity.
 */
export function useSettingsForm() {
  const [form, setForm] = useState<SettingsFormState>(DEFAULT_SETTINGS);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the backend's active LLM provider on mount.
  useEffect(() => {
    getSettings()
      .then(s => setForm(prev => ({ ...prev, llmProvider: s.llm_provider })))
      .catch(() => { /* backend unreachable — keep defaults/localStorage */ });
  }, []);

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
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      try {
        await updateSettings({ llm_provider: form.llmProvider });
        // Persist non-backend fields to localStorage for UI continuity.
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              llmProvider: form.llmProvider,
              vectorDB: form.vectorDB,
              envRegion: form.envRegion,
              indexName: form.indexName,
              hybridWeight: form.hybridWeight,
            }),
          );
        } catch {
          // localStorage may be unavailable (e.g. private browsing)
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save settings');
      }
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

  return { form, showKey, saved, error, setField, toggleShowKey, handleSave, handleReset };
}
