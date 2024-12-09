import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const useUpdateSubscription = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const updateSubscription = async (subscriptionId: string, updatedData: any): Promise<boolean> => {
        const authToken = localStorage.getItem('authToken');
        setLoading(true);
        setError(null);

        try {
            const response = await axios.put(`${API_URL}/api/plans/${subscriptionId}`, updatedData, {
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
            setError('Failed to update subscription');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { updateSubscription, loading, error };
};
