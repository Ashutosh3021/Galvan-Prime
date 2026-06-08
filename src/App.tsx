import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './router/AppRoutes';

/**
 * Root application component.
 * Wraps the app in BrowserRouter for client-side routing.
 * Includes a skip-to-content link for keyboard/screen-reader accessibility.
 */
function App() {
  return (
    <BrowserRouter>
      {/* Skip nav — only visible on keyboard focus, lets screen-reader users
          jump past repeated navigation directly to main content */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
