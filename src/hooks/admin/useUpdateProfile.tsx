import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface UpdateProfileResponse {
    success: boolean;
    message: string;
}

interface UseUpdateProfileResult {
    updateProfile: (id: string, data: { name: string; email: string; password?: string }) => Promise<void>;
    loading: boolean;
    error: string | null;
    successMessage: string | null;
}

export const useUpdateProfile = (): UseUpdateProfileResult => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const updateProfile = async (id: string, data: { name: string; email: string; password?: string }) => {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            setError('Unauthorized: No token found');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await axios.put<UpdateProfileResponse>(`${API_URL}/api/users/users/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.status === 200) {
                setSuccessMessage(response.data.message || 'Profile updated successfully');
            } else {
                setError(response.data.message || 'Failed to update profile');
            }
        } catch (err) {
            setError('An error occurred while updating the profile');
        } finally {
            setLoading(false);
        }
    };

    return { updateProfile, loading, error, successMessage };
};
