import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const useAddSubscription = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const addSubscription = async (subscriptionData: any): Promise<boolean> => {
        const authToken = localStorage.getItem('authToken');
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_URL}/api/plans/create`, subscriptionData, {
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
            console.log(err);
            setError('Failed to add subscription');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { addSubscription, loading, error };
};
