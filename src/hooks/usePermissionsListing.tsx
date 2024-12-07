import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface Permission {
    id: string; // Mapped from _id
    name: string;
}

export const usePermissionsListing = () => {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPermissions = async () => {
            const authToken = localStorage.getItem('authToken');

            try {
                const response = await axios.get(`${API_URL}/api/roles/permissions`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (response.data.success) {
                    const mappedPermissions = response.data.data.permissions.map((perm: any) => ({
                        id: perm._id,
                        name: perm.name,
                    }));
                    setPermissions(mappedPermissions);
                } else {
                    setError(response.data.message || 'Failed to fetch permissions');
                }
            } catch (err) {
                setError('An error occurred while fetching permissions');
            } finally {
                setLoading(false);
            }
        };

        fetchPermissions();
    }, []);

    return {
        permissions,
        loading,
        error,
    };
};
