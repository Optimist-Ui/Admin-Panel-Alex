import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface Role {
    id: string; // Mapped from _id
    name: string;
    permissions: string[]; // Array of permission names
}

export const useGetRoleById = (roleId: string) => {
    const [role, setRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRoleById = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const authToken = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/api/roles/${roleId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.data.success) {
                const mappedRole = {
                    id: response.data.data._id,
                    name: response.data.data.name,
                    permissions: response.data.data.permissions.map((perm: any) => perm.name),
                };
                setRole(mappedRole);
            } else {
                setError(response.data.message || 'Failed to fetch role');
            }
        } catch (err) {
            setError('An error occurred while fetching the role');
        } finally {
            setLoading(false);
        }
    }, [roleId]);

    useEffect(() => {
        if (roleId) {
            fetchRoleById();
        }
    }, [roleId, fetchRoleById]);

    return {
        role,
        loading,
        error,
        refetchRole: fetchRoleById, // Expose function to refetch role
    };
};
