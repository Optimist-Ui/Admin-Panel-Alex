import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const useDeleteSubscription = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const deleteSubscription = async (subscriptionId: string): Promise<boolean> => {
        const authToken = localStorage.getItem('authToken');
        setLoading(true);
        setError(null);

        try {
            const response = await axios.delete(`${API_URL}/api/plans/${subscriptionId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.data.success) {
                return true;
            } else {
                setError(response.data.message);
                return false;
            }
        } catch (err) {
            setError('Failed to delete subscription');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { deleteSubscription, loading, error };
};
