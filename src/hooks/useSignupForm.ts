import { useState, useCallback, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export interface SignupFormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
  passwordError: boolean;
  isSubmitting: boolean;
  error: string | null;
}

/**
 * useSignupForm
 *
 * Shared signup logic used by both DesktopSignup and MobileSignup.
 */
export function useSignupForm() {
  const navigate = useNavigate();

  const [state, setState] = useState<SignupFormState>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
    passwordError: false,
    isSubmitting: false,
    error: null,
  });

  const setField = useCallback(
    <K extends keyof SignupFormState>(key: K, value: SignupFormState[K]) => {
      setState(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  /** Live-validate confirm password on each keystroke */
  const handleConfirmChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setState(prev => ({
        ...prev,
        confirmPassword: val,
        passwordError: val.length > 0 && val !== prev.password,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (state.password !== state.confirmPassword) {
        setState(prev => ({ ...prev, passwordError: true }));
        return;
      }
      setState(prev => ({ ...prev, isSubmitting: true, error: null }));
      try {
        await new Promise<void>(res => setTimeout(res, 1500));
        navigate('/profile');
      } catch {
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          error: 'Registration failed. Please try again.',
        }));
      }
    },
    [state.password, state.confirmPassword, navigate]
  );

  return { state, setField, handleConfirmChange, handleSubmit };
}
