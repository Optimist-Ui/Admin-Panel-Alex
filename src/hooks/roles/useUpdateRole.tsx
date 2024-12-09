import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface Role {
    id: string;
    name: string;
    permissions: string[];
}

export const useUpdateRole = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const updateRole = async (role: Role): Promise<boolean> => {
        setLoading(true);
        setError(null);

        console.log(role);

        try {
            const authToken = localStorage.getItem('authToken');
            const response = await axios.put(
                `${API_URL}/api/roles/${role.id}`,
                {
                    name: role.name,
                    permissions: role.permissions,
                },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            if (response.data.success) {
                return true;
            } else {
                setError(response.data.message || 'Failed to update role');
                return false;
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to update role');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        updateRole,
        loading,
        error,
    };
};
