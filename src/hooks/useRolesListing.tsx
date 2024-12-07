import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface Role {
    id: string; // Mapped from _id
    name: string;
    permissions: string[]; // Assuming permissions are an array of strings
}

export const useRolesListing = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const authToken = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/api/roles`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.data.success) {
                const mappedRoles = response.data.data.map((role: any) => ({
                    id: role._id,
                    name: role.name,
                    permissions: role.permissions || [],
                }));
                setRoles(mappedRoles);
            } else {
                setError(response.data.message || 'Failed to fetch roles');
            }
        } catch (err) {
            setError('An error occurred while fetching roles');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    return {
        roles,
        loading,
        error,
        refetchRoles: fetchRoles, // Expose the function to refetch roles
    };
};
