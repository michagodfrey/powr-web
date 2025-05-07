// Main routing configuration with lazy-loaded components
// Handles protected routes and authentication flow
import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "../auth/ProtectedRoute";
import Layout from "../components/Layout";
import { useAuth } from "../auth/AuthContext";

// Lazy loading components for better performance
const Dashboard = lazy(() => import("../pages/Dashboard"));
const ExerciseDetail = lazy(() => import("../pages/ExerciseDetail"));
const Settings = lazy(() => import("../pages/Settings"));
const Login = lazy(() => import("../pages/Login"));
const SignUp = lazy(() => import("../pages/SignUp"));
const AuthCallback = lazy(() => import("../auth/AuthCallback"));
const Home = lazy(() => import("../pages/Home"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/home" element={<Home />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />
        <Route
          path="/exercise/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ExerciseDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
