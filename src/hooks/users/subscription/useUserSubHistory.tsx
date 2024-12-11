import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const useUserSubHistory = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [subHistory, setSubHistory] = useState<any | null>(null);

    const fetchSubHistory = async (userId: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const authToken = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/api/subscription-histories/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.status === 200 && response.data) {
                setSubHistory(response.data); // Set the subscription history data.
                return true;
            } else {
                setError('No subscription history found for this user');
                return false;
            }
        } catch (err: any) {
            if (err.response && err.response.status === 404) {
                // Handle 404 explicitly and set a meaningful message.
                setError(err.response.data.message || 'No subscription history found for this user');
            } else {
                // Handle other errors.
                setError('An error occurred while fetching subscription history');
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        fetchSubHistory,
        subHistory,
        loading,
        error,
    };
};
