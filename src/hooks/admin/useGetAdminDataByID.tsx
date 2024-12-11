import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface AdminData {
    _id: string;
    name: string;
    email: string;
}

export const useGetAdminDataByID = (id: string) => {
    const [adminData, setAdminData] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAdminData = async () => {
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                setError('Unauthorized: No token found');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/api/users/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                setAdminData(response.data);
            } catch (err) {
                setError('Failed to fetch admin data');
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, [id]);

    return { adminData, loading, error };
};
