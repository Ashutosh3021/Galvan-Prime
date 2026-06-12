import { useState, useCallback } from 'react';
import { queryDocument } from '../api/query';
import type { ChatMessage, QueryCitation } from '../types';

interface UseChatOptions {
  collection: string;
}

export function useChat({ collection }: UseChatOptions) {
  const [sessionId] = useState<string>(() => crypto.randomUUID());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (question: string) => {
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
        const res = await queryDocument({ question: question.trim(), collection, session_id: sessionId });
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

  return { messages, sessionId, isLoading, error, sendMessage, clearSession };
}
