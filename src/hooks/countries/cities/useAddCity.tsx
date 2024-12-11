import { useState, useCallback } from 'react';
import axios from 'axios';

// Environment variable for the API URL
const API_URL = import.meta.env.VITE_API_URL;

// Custom hook for adding a city
export const useAddCity = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const addCity = useCallback(async (cityData: Record<string, any>) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await axios.post(`${API_URL}/api/cities/create`, cityData);

            if (response.data.success) {
                setSuccess(true);
                return response.data.data; // Return the added city data
            } else {
                setError(response.data.message || 'Failed to add the city');
            }
        } catch (err: any) {
            console.log(err);
            setError(err?.response?.data?.message || 'An error occurred while adding the city');
        } finally {
            setLoading(false);
        }
    }, []);

    const resetStates = () => {
        setError(null);
        setSuccess(false);
    };

    return {
        addCity,
        loading,
        error,
        success,
        resetStates,
    };
};
