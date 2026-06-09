import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '../components/shared/Layout';

// Code-split every page — only the active route's bundle is loaded
const HomePage    = lazy(() => import('../pages/HomePage'));
const QueryPage   = lazy(() => import('../pages/QueryPage'));
const ApiDocsPage = lazy(() => import('../pages/ApiDocsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const StatusPage  = lazy(() => import('../pages/StatusPage'));
const EvalPage    = lazy(() => import('../pages/EvalPage'));
const IngestPage  = lazy(() => import('../pages/IngestPage'));
const LoginPage   = lazy(() => import('../pages/LoginPage'));
const SignupPage  = lazy(() => import('../pages/SignupPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));

/** Minimal full-screen skeleton shown while a lazy chunk loads */
function PageSkeleton() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-surface-container-lowest"
      role="status"
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-primary-container border-t-transparent animate-spin" />
        <span className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant">
          Loading…
        </span>
      </div>
    </div>
  );
}

/**
 * AppRoutes
 *
 * Route tree for GalvanR.A.G. Every page is lazily loaded for performance.
 * A lightweight skeleton is shown via Suspense while chunks are fetched.
 *
 * Route map:
 *   /          → Redirect to /login
 *   /home      → Home
 *   /query     → Chat / Query interface
 *   /api-docs  → API Reference
 *   /settings  → System Configuration
 *   /status    → System Health
 *   /eval      → Evaluation Suite
 *   /ingest    → Document Ingestion
 *   /login     → Login
 *   /signup    → Signup
 *   /profile   → User Profile
 */
export default function AppRoutes() {
  const location = useLocation();

  return (
    <Layout>
      <Suspense fallback={<PageSkeleton />}>
        {/*
          key={location.pathname} remounts the Suspense boundary on navigation
          so the skeleton always shows during a new lazy load, not just the first.
        */}
        <Routes location={location} key={location.pathname}>
          <Route path="/"          element={<Navigate to="/login" replace />} />
          <Route path="/home"     element={<HomePage />} />
          <Route path="/query"    element={<QueryPage />} />
          <Route path="/api-docs"  element={<ApiDocsPage />} />
          <Route path="/settings"  element={<SettingsPage />} />
          <Route path="/status"    element={<StatusPage />} />
          <Route path="/eval"      element={<EvalPage />} />
          <Route path="/ingest"    element={<IngestPage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/signup"    element={<SignupPage />} />
          <Route path="/profile"   element={<ProfilePage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
