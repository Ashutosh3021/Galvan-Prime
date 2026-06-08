import { useState, useCallback, type FormEvent } from 'react';
import type { SettingsFormState } from '../types';

const DEFAULT_SETTINGS: SettingsFormState = {
  llmProvider: 'gemini',
  apiKey: '************************',
  vectorDB: 'pinecone',
  envRegion: 'us-east-1-aws',
  indexName: 'galvan-docs-prod',
  hybridWeight: 70,
};

/**
 * useSettingsForm
 *
 * Shared settings form logic consumed by both DesktopSettings and
 * MobileSettings.
 */
export function useSettingsForm() {
  const [form, setForm] = useState<SettingsFormState>(DEFAULT_SETTINGS);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const setField = useCallback(
    <K extends keyof SettingsFormState>(key: K, value: SettingsFormState[K]) => {
      setForm(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleShowKey = useCallback(() => {
    setShowKey(v => !v);
  }, []);

  const handleSave = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    []
  );

  const handleReset = useCallback(() => {
    setForm(DEFAULT_SETTINGS);
  }, []);

  return { form, showKey, saved, setField, toggleShowKey, handleSave, handleReset };
}
