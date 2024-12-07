import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string; // Optional role check
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { authToken, role, loading } = useAuth();

    // Show a loading spinner or message while the auth state is loading
    if (loading) {
        return <div>Loading...</div>;
    }

    // If not authenticated, redirect to the login page
    if (!authToken) {
        return <Navigate to="/login" />;
    }

    // If a role is required and the user's role doesn't match, redirect to unauthorized page
    if (requiredRole && role !== requiredRole) {
        return <Navigate to="/unauthorized" />;
    }

    // Render the child component if authenticated and role is valid
    return <>{children}</>;
};

export default ProtectedRoute;
