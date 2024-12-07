import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const useDeleteUser = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const deleteUser = async (userId: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const authToken = localStorage.getItem('authToken');
            const response = await axios.delete(`${API_URL}/api/users/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.data.message === 'User deleted successfully') {
                return true;
            } else {
                setError(response.data.message || 'Failed to delete user');
                return false;
            }
        } catch (err) {
            setError('An error occurred while deleting the user');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        deleteUser,
        loading,
        error,
    };
};
