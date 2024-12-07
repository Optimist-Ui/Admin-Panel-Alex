import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const useUpdateUser = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const updateUser = async (userId: string, updateData: Record<string, any>): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const authToken = localStorage.getItem('authToken');
            const response = await axios.put(`${API_URL}/api/users/users/${userId}`, updateData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.status === 200 && response.data) {
                return true; // Ensure success based on response status
            } else {
                setError('Failed to update user');
                return false;
            }
        } catch (err) {
            setError('An error occurred while updating the user');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        updateUser,
        loading,
        error,
    };
};
