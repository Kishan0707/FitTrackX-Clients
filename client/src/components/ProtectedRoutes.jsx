import { Navigate, useLocation } from "react-router-dom";
import React, { useContext } from "react";
import { AuthContext } from "../context/authContext";

const ProtectedRoutes = ({ children, allowedRoles = [] }) => {
  const { user, loading, onboardingComplete } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-red-500"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  if (allowedRoles.length > 0) {
    const normalizedUserRole = String(user.role || "user").toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map((role) =>
      String(role).toLowerCase(),
    );

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      return (
        <Navigate
          to="/unauthorized"
          replace
          state={{ from: location.pathname }}
        />
      );
    }
  }

  const currentPath = location.pathname.toLowerCase();
  const isOnboardingRoute = currentPath === "/onboarding";
  if (user && !onboardingComplete && !isOnboardingRoute) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoutes;
