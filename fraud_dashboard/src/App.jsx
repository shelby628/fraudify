import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AuditLogs from "./pages/AuditLogs";
import ManualReviewPage from "./pages/ManualReviewPage";
import UserViewPage from "./pages/UserViewPage";
import Login from "./pages/login";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

/* =========================
   ADMIN GUARD
========================= */
const RequireAdmin = ({ children }) => {
  const isStaff = localStorage.getItem("is_staff") === "true";

  if (!isStaff) {
    return <Navigate to="/user-view" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* All authenticated users */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* NORMAL USER */}
        <Route path="/user-view" element={<UserViewPage />} />

        {/* ADMIN ONLY */}
        <Route
          path="/dashboard"
          element={
            <RequireAdmin>
              <Dashboard />
            </RequireAdmin>
          }
        />

        <Route
          path="/manual-review"
          element={
            <RequireAdmin>
              <ManualReviewPage />
            </RequireAdmin>
          }
        />

        <Route
          path="/audit-logs"
          element={
            <RequireAdmin>
              <AuditLogs />
            </RequireAdmin>
          }
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
