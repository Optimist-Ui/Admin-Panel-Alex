import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const useRoleDelete = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const deleteRole = async (roleId: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const authToken = localStorage.getItem('authToken');
            const response = await axios.delete(`${API_URL}/api/roles/${roleId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.data.success) {
                return true;
            } else {
                setError(response.data.message || 'Failed to delete role');
                return false;
            }
        } catch (err) {
            setError('An error occurred while deleting the role');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        deleteRole,
        loading,
        error,
    };
};
