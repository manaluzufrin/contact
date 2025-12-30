import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function RoleRoute({ roles }) {
  const { isAuthed, currentUser } = useAuth();

  if (!isAuthed) return <Navigate to="/login" replace />;

  if (Array.isArray(roles) && roles.length) {
    const role = currentUser?.role;
    const ok = roles.includes(role);
    if (!ok) return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
