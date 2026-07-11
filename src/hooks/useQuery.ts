import { useState, useCallback, useEffect } from 'react';
import { queryDocument, getProviders } from '../api/query';
import type { ChatMessage, QueryCitation, ProvidersResponse } from '../types';

interface UseChatOptions {
  collection: string;
}

export function useChat({ collection }: UseChatOptions) {
  const [sessionId] = useState<string>(() => crypto.randomUUID());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProvidersResponse | null>(null);

  // Load the LLM providers this deployment can actually use.
  useEffect(() => {
    let active = true;
    getProviders()
      .then(p => { if (active) setProviders(p); })
      .catch(() => { /* providers endpoint is optional */ });
    return () => { active = false; };
  }, []);

  const sendMessage = useCallback(
    async (question: string, provider?: string) => {
      if (!question.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: question.trim(),
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      try {
        const res = await queryDocument({
          question: question.trim(),
          collection,
          session_id: sessionId,
          provider: provider || undefined,
        });
        const botMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: res.answer,
          citations: res.citations as QueryCitation[],
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, botMsg]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [collection, isLoading, sessionId],
  );

  const clearSession = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, sessionId, isLoading, error, sendMessage, clearSession, providers };
}
