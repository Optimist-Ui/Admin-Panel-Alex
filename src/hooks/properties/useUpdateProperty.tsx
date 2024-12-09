import { useState, useCallback } from 'react';
import axios from 'axios';

// Environment variable for the API URL
const API_URL = import.meta.env.VITE_API_URL;

// Custom hook for updating a property
export const useUpdateProperty = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const updateProperty = useCallback(async (propertyId: string, updateData: Record<string, any>) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const authToken = localStorage.getItem('authToken'); // Replace with your token logic if needed
            const response = await axios.put(`${API_URL}/api/properties/${propertyId}`, updateData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            console.log(propertyId, updateData);

            if (response.data.success) {
                setSuccess(true);
                return response.data.data; // Return the updated property data
            } else {
                setError(response.data.message || 'Failed to update the property');
            }
        } catch (err: any) {
            setError(err || 'An error occurred while updating the property');
        } finally {
            setLoading(false);
        }
    }, []);

    const resetStates = () => {
        setError(null);
        setSuccess(false);
    };

    return {
        updateProperty,
        loading,
        error,
        success,
        resetStates,
    };
};
