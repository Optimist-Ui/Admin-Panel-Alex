import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface RegisterData {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

interface RegisterResponse {
    success: boolean;
    message: string;
    data?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        role: string;
        sellerType: string | null;
        is_already_agent: boolean;
        isVerified: boolean;
    };
}

const useRegister = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const registerUser = async (userData: RegisterData) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await axios.post<RegisterResponse>(`${API_URL}/api/users/admin/create-user`, userData);
            if (response.data.success) {
                setSuccessMessage(response.data.message);
            } else {
                setError('Failed to register user.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return { registerUser, loading, error, successMessage };
};

export default useRegister;
