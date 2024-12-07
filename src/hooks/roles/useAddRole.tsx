import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface Role {
    name: string;
}

export const useAddRole = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const addRole = async (role: Role): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const authToken = localStorage.getItem('authToken');
            const response = await axios.post(
                `${API_URL}/api/roles`,
                { name: role.name },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            if (response.data.success) {
                return true;
            } else {
                setError(response.data.message || 'Failed to add role');
                return false;
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to add role');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        addRole,
        loading,
        error,
    };
};
