import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './router/AppRoutes';

/**
 * Root application component.
 * Wraps the app in BrowserRouter for client-side routing.
 */
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
