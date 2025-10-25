import React, { lazy, Suspense, JSX } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthProvider";


const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard")); // Employee
const AdminDashboard = lazy(() => import("./pages/AdminDashboard")); // Admin


const ProtectedRoute = ({ children, role }: { children: JSX.Element; role: "admin" | "employee" }) => {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) return <Navigate to="/login" replace />;

  if (role && userRole !== role) {
    return <Navigate to={userRole === "admin" ? "/admin" : "/employee"} replace />;
  }

  return children;
};


const AppRoutes = () => {
  const { currentUser, userRole } = useAuth();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/employee"
          element={
            <ProtectedRoute role="employee">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

      
        <Route
          path="/"
          element={
            currentUser ? (
              <Navigate to={userRole === "admin" ? "/admin" : "/employee"} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

       
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;
