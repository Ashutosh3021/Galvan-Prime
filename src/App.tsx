import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './router/AppRoutes';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
