import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const useDeleteCountry = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const deleteCountry = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.delete(`${API_URL}/api/country/countries/${id}`);

            if (response.data.success) {
                return true; // Signal success
            } else {
                setError(response.data.message);
                return false;
            }
        } catch (err) {
            setError('Failed to delete country');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        deleteCountry,
        loading,
        error,
    };
};
