import { useState, useCallback } from 'react';
import axios from 'axios';

// Environment variable for the API URL
const API_URL = import.meta.env.VITE_API_URL;

// Custom hook for adding a property
export const useAddProperty = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const addProperty = useCallback(async (propertyData: Record<string, any>) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const authToken = localStorage.getItem('authToken'); // Replace with your token logic if needed
            const response = await axios.post(`${API_URL}/api/properties/`, propertyData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.data.success) {
                setSuccess(true);
                return response.data.data; // Return the added property data
            } else {
                setError(response.data.message || 'Failed to add the property');
            }
        } catch (err: any) {
            console.log(err);
            setError(err?.response?.data?.message || 'An error occurred while adding the property');
        } finally {
            setLoading(false);
        }
    }, []);

    const resetStates = () => {
        setError(null);
        setSuccess(false);
    };

    return {
        addProperty,
        loading,
        error,
        success,
        resetStates,
    };
};
