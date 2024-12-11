import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export type User = {
    id: string; // Mapped from _id
    name: string;
    email: string;
    is_already_agent: boolean; // Mapped from is_already_agent
    isVerified: boolean; // Mapped from isVerified
    sellerType?: string | null; // Optional field
};

type UsersResponse = {
    success: boolean;
    message: string;
    data: {
        users: {
            sellerType: string | null;
            is_already_agent: boolean;
            isVerified: boolean;
            _id: string;
            name: string;
            email: string;
        }[];
        totalUsers: number;
        totalPages: number;
        currentPage: number;
    };
};

export const useUsersListing = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        const authToken = localStorage.getItem('authToken');
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<UsersResponse>(`${API_URL}/api/users/list`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.data.success) {
                const mappedUsers = response.data.data.users.map((user) => ({
                    id: user._id,
                    name: user.name,
                    email: user.email,

                    is_already_agent: user.is_already_agent,
                    isVerified: user.isVerified,
                    sellerType: user.sellerType,
                }));
                setUsers(mappedUsers);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return {
        users,
        loading,
        error,
        refetchUsers: fetchUsers, // Expose the function for external use
    };
};
