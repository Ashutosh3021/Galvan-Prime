import { Routes, Route } from 'react-router-dom';
import Layout from '../components/shared/Layout';

// Pages
import HomePage from '../pages/HomePage';
import ApiDocsPage from '../pages/ApiDocsPage';
import QueryPage from '../pages/QueryPage';
import SettingsPage from '../pages/SettingsPage';
import StatusPage from '../pages/StatusPage';
import EvalPage from '../pages/EvalPage';
import IngestPage from '../pages/IngestPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ProfilePage from '../pages/ProfilePage';

/**
 * AppRoutes
 *
 * Defines the full route tree for GalvanR.A.G.
 * Each route renders a Page component that internally delegates to either
 * a desktop or mobile variant via <ResponsiveWrapper>.
 *
 * Route map:
 *   /                → Home
 *   /query           → Chat / Query interface
 *   /api-docs        → API Reference
 *   /settings        → System Configuration
 *   /status          → System Health
 *   /eval            → Evaluation Suite  (mobile-first, also accessible on desktop)
 *   /ingest          → Document Ingestion (mobile-first, also accessible on desktop)
 *   /login           → Login
 *   /signup          → Signup
 *   /profile         → User Profile
 */
export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/"               element={<HomePage />} />
        <Route path="/query"          element={<QueryPage />} />
        <Route path="/api-docs"       element={<ApiDocsPage />} />
        <Route path="/settings"       element={<SettingsPage />} />
        <Route path="/status"         element={<StatusPage />} />
        <Route path="/eval"           element={<EvalPage />} />
        <Route path="/ingest"         element={<IngestPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/signup"         element={<SignupPage />} />
        <Route path="/profile"        element={<ProfilePage />} />
      </Routes>
    </Layout>
  );
}
