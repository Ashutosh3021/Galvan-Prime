import { useState, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export interface LoginFormState {
  email: string;
  password: string;
  rememberMe: boolean;
  showPassword: boolean;
  isSubmitting: boolean;
  error: string | null;
}

/**
 * useLoginForm
 *
 * Encapsulates all login form state and handlers so that DesktopLogin and
 * MobileLogin remain purely presentational — they just spread the returned
 * props and render markup.
 */
export function useLoginForm() {
  const navigate = useNavigate();

  const [state, setState] = useState<LoginFormState>({
    email: '',
    password: '',
    rememberMe: false,
    showPassword: false,
    isSubmitting: false,
    error: null,
  });

  const setField = useCallback(
    <K extends keyof LoginFormState>(key: K, value: LoginFormState[K]) => {
      setState(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleShowPassword = useCallback(() => {
    setState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!state.email.trim() || !state.password.trim()) return;

      setState(prev => ({ ...prev, isSubmitting: true, error: null }));
      try {
        // Simulate async auth — swap with real API call
        await new Promise<void>(res => setTimeout(res, 800));
        navigate('/profile');
      } catch {
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          error: 'Invalid credentials. Please try again.',
        }));
      }
    },
    [state.email, state.password, navigate]
  );

  return { state, setField, toggleShowPassword, handleSubmit };
}
