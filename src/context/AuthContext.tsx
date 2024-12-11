import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios'; // For API requests

const API_URL = import.meta.env.VITE_API_URL;

// Define the AuthContext type
interface AuthContextType {
    authToken: string | null;
    role: string | null;
    id: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    refreshAuthToken: () => Promise<void>;
}

// Create AuthContext with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for AuthProvider
interface AuthProviderProps {
    children: ReactNode;
}

// AuthProvider component
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('authToken')); // JWT token
    const [role, setRole] = useState<string | null>(() => localStorage.getItem('role')); // User role
    const [id, setId] = useState<string | null>(() => localStorage.getItem('id')); // User role
    const [loading, setLoading] = useState<boolean>(false); // Loading state

    useEffect(() => {
        // Check localStorage for auth token and role
        const savedToken = localStorage.getItem('authToken');
        const savedRole = localStorage.getItem('role');
        const tokenTimestamp = localStorage.getItem('tokenTimestamp');

        if (savedToken && savedRole && tokenTimestamp) {
            const isTokenExpired = Date.now() - parseInt(tokenTimestamp, 10) > 45 * 60 * 1000; // 45 minutes
            if (isTokenExpired) {
                logout();
            } else {
                setAuthToken(savedToken);
                setRole(savedRole);
            }
        }

        setLoading(false);

        // Periodic check for token expiration
        const interval = setInterval(() => {
            const tokenTimestamp = localStorage.getItem('tokenTimestamp');
            if (tokenTimestamp) {
                const isTokenExpired = Date.now() - parseInt(tokenTimestamp, 10) > 45 * 60 * 1000; // 45 minutes
                if (isTokenExpired) {
                    logout();
                }
            }
        }, 60 * 1000); // Check every minute

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    // Function to refresh the auth token
    const refreshAuthToken = async (): Promise<void> => {
        setLoading(true);
        const refreshToken = localStorage.getItem('refreshToken'); // Get the refresh token from storage
        if (!refreshToken) {
            console.error('No refresh token available');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/api/users/refresh-token`, { refreshToken });
            const { token, newRefreshToken } = response.data.data;
            setAuthToken(token);
            setRole(response.data.data.user.role);

            localStorage.setItem('authToken', token);
            localStorage.setItem('refreshToken', newRefreshToken); // Update refresh token
            localStorage.setItem('tokenTimestamp', Date.now().toString()); // Update timestamp

            setLoading(false);
        } catch (error: any) {
            console.error('Failed to refresh token:', error.response?.data?.message || error.message);
            logout(); // Log out if refresh token fails
            setLoading(false);
        }
    };

    // Login with email and password
    const login = async (email: string, password: string): Promise<void> => {
        setLoading(true); // Set loading to true when login is in progress
        try {
            const response = await axios.post(`${API_URL}/api/users/login`, { email, password });
            const { token, refreshToken } = response.data.data;
            const { role } = response.data.data.user;
            const { id } = response.data.data.user;

            setAuthToken(token);
            setRole(role);
            setId(id);

            localStorage.setItem('authToken', token);
            localStorage.setItem('role', role);
            localStorage.setItem('id', id);
            localStorage.setItem('refreshToken', refreshToken); // Store the refresh token
            localStorage.setItem('tokenTimestamp', Date.now().toString()); // Store timestamp

            setLoading(false); // Set loading to false after successful login
        } catch (error: any) {
            console.error('Login failed:', error.response?.data?.message || error.message);
            setLoading(false); // Set loading to false even on error
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    // Logout
    const logout = (): void => {
        setAuthToken(null);
        setRole(null);
        setId(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('role');
        localStorage.removeItem('id');
        localStorage.removeItem('refreshToken'); // Remove refresh token
        localStorage.removeItem('tokenTimestamp'); // Remove timestamp
    };

    return <AuthContext.Provider value={{ authToken, role, id, login, logout, loading, refreshAuthToken }}>{children}</AuthContext.Provider>;
};

// Custom hook to access AuthContext
const useAuth = (): AuthContextType => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export { AuthProvider, useAuth };
