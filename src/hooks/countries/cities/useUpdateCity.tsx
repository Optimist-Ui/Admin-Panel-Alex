import { useState, useCallback } from 'react';
import axios from 'axios';

// Environment variable for the API URL
const API_URL = import.meta.env.VITE_API_URL;

// Custom hook for updating a city
const useUpdateCity = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const updateCity = useCallback(async (cityId: string, cityData: Record<string, any>) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await axios.put(`${API_URL}/api/cities/${cityId}`, cityData);

            if (response.data.success) {
                setSuccess(true);
                return response.data.data; // Return the updated city data
            } else {
                setError(response.data.message || 'Failed to update the city');
            }
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || 'An error occurred while updating the city');
        } finally {
            setLoading(false);
        }
    }, []);

    const resetStates = () => {
        setError(null);
        setSuccess(false);
    };

    return {
        updateCity,
        loading,
        error,
        success,
        resetStates,
    };
};

export default useUpdateCity;
