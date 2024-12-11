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
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                throw new Error('Authentication token is missing');
            }

            const response = await axios.put(`${API_URL}/api/properties/${propertyId}`, updateData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.data.success) {
                setSuccess(true);
                return { data: response.data.data, success: true }; // Return success and data
            } else {
                const message = response.data.message || 'Failed to update the property';
                setError(message);
                return { success: false, error: message };
            }
        } catch (err: any) {
            const message = err.response?.data?.message || 'An error occurred while updating the property';
            setError(message);
            return { success: false, error: message };
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
