// src/App.jsx
import { Suspense, useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import { Toaster } from "./components/ui/sonner";
import FileViewer from "./pages/FileViwer";
import Login from "./pages/Login";
import MyDrive from "./pages/Mydrive";
import NotFoundPage from "./pages/NotFoundPage";
import Profile from "./pages/Profile";
import Recent from "./pages/Recent";
import Register from "./pages/Register";
import SharedWithMe from "./pages/SharedWithMe";
import Starred from "./pages/Starred";
import Trash from "./pages/Trash";
import ProtectedRoute from "./routes/ProctectedRoute";
import PublicRoute from "./routes/PublicRoute";
import useAuthStore from "./store/authStore";
// const FileViewer = React.lazy(() => import("./pages/FileViewer"));

const App = () => {
  // selector-based subscriptions — prevents re-renders when unrelated store keys change
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    // call once on mount (fetchProfile is stable from the store)
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
      </div>
    );
  }
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500 rounded-full animate-spin"></div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Loading Drive
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Getting your files ready...
          </p>
        </div>
      </div>
    </div>
  );
  return (
    <Router>
      <Toaster position="bottom-right" richColors />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected area */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MyDrive />} />
          <Route path="directory/:parentId" element={<MyDrive />} />
          <Route path="starred" element={<Starred />} />
          <Route path="shared" element={<SharedWithMe />} />
          <Route path="profile" element={<Profile />} />
          <Route path="recent" element={<Recent />} />
          <Route path="trash" element={<Trash />} />
          <Route
            path="/file/:fileId"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <FileViewer mode="private" />
              </Suspense>
            }
          />
          <Route
            path="/view/:fileId"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <FileViewer mode="view" />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
