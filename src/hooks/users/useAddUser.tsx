import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface UserData {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

interface UserResponse {
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

const useAddUser = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const addUser = async (userData: UserData) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await axios.post<UserResponse>(`${API_URL}/api/users/admin/create-user`, userData);
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

    return { addUser, loading, error, successMessage };
};

export default useAddUser;
