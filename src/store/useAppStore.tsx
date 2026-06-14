/**
 * Minimal global state using React context + useReducer.
 * Keeps active collection in sync between CollectionsPage and QueryPage.
 */
import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react';

interface AppState {
  activeCollection: string;
}

type AppAction = { type: 'SET_ACTIVE_COLLECTION'; payload: string };

const DEFAULT_STATE: AppState = { activeCollection: '' };

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_COLLECTION':
      return { ...state, activeCollection: action.payload };
    default:
      return state;
  }
}

const AppStateCtx = createContext<AppState>(DEFAULT_STATE);
const AppDispatchCtx = createContext<Dispatch<AppAction>>(() => undefined);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);
  return (
    <AppStateCtx.Provider value={state}>
      <AppDispatchCtx.Provider value={dispatch}>
        {children}
      </AppDispatchCtx.Provider>
    </AppStateCtx.Provider>
  );
}

export function useAppState() {
  return useContext(AppStateCtx);
}

export function useAppDispatch() {
  return useContext(AppDispatchCtx);
}
