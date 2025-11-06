// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';
import type { User, LoginCredentials } from '../types/auth';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    hasRole: (role: string) => boolean;
    hasPermission: (permission: string) => boolean;
    refreshUser: () => Promise<void>; // Aggiungi questa funzione
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    // Funzione per aggiornare i dati dell'utente corrente
    const refreshUser = async () => {
        try {
            const response = await api.get<User>('/user');
            setUser(response.data);
        } catch (error) {
            console.error('Error refreshing user:', error);
            // Se c'è un errore, fai il logout
            await logout();
        }
    };

    // Verifica lo stato di autenticazione all'avvio
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    await refreshUser();
                    setIsAuthenticated(true);
                } catch (error) {
                    // Token non valido, rimuovilo
                    localStorage.removeItem('token');
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }
            setLoading(false);
        };

        void checkAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await api.post('/login', credentials);
            const { access_token, user } = response.data;

            // Salva il token
            localStorage.setItem('token', access_token);

            // Imposta l'header di autorizzazione per le richieste future
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            setUser(user);
            setIsAuthenticated(true);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const hasRole = (role: string): boolean => {
        return user?.roles.some(r => r.name === role) || false;
    };

    const hasPermission = (permission: string): boolean => {
        return user?.permissions.includes(permission) || false;
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            login,
            logout,
            hasRole,
            hasPermission,
            refreshUser, // Esponi la funzione
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};