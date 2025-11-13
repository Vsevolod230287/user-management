// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
    children: React.ReactElement;
    roles?: string[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
                                                              children,
                                                              roles = []
                                                          }) => {
    const { isAuthenticated, user, hasRole } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Reindirizza al login salvando la posizione corrente
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Controlla i ruoli se specificati
    if (roles.length > 0 && user) {
        const hasRequiredRole = roles.some(role => hasRole(role));
        if (!hasRequiredRole) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};
