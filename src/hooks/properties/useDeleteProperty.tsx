import { useState, useCallback } from 'react';
import axios from 'axios';

// Environment variable for the API URL
const API_URL = import.meta.env.VITE_API_URL;

// Custom hook for deleting a property
export const useDeleteProperty = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const deleteProperty = useCallback(async (propertyId: string) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const authToken = localStorage.getItem('authToken'); // Replace with your token logic if needed
            const response = await axios.delete(`${API_URL}/api/properties/${propertyId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.data.success) {
                setSuccess(true);
                return response.data.message; // Return success message
            } else {
                setError(response.data.message || 'Failed to delete the property');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'An error occurred while deleting the property');
        } finally {
            setLoading(false);
        }
    }, []);

    // Reset the states after a successful deletion
    const resetStates = () => {
        setError(null);
        setSuccess(false);
    };

    return {
        deleteProperty,
        loading,
        error,
        success,
        resetStates,
    };
};
