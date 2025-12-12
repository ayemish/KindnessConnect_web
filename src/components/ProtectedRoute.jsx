// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        // Wait until Firebase checks the authentication state
        return <div className="text-center py-20 text-gray-500">Authenticating session...</div>;
    }

    // 1. Check if the user is authenticated at all
    if (!user) {
        // If not logged in, redirect to the login page
        return <Navigate to="/login" replace />;
    }

    // 2. Check if the user has the required role (if roles are specified)
    if (allowedRoles && user.role) {
        if (!allowedRoles.includes(user.role)) {
            // If logged in but lacks the required role (e.g., donor trying to access admin page)
            alert("Access Denied: You do not have the required role.");
            return <Navigate to="/" replace />; // Redirect to home or a forbidden page
        }
    }

    // If authenticated and authorized, render the child components (the protected page)
    return children;
};

export default ProtectedRoute;