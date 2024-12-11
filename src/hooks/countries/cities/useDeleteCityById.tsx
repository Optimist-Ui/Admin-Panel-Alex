import { useState, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL;

export const useDeleteCityById = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const deleteCity = useCallback(async (id: string) => {
        try {
            const response = await axios.delete(`${API_URL}/api/cities/${id}`);

            if (response.data.success) {
                return true;
            } else {
                setError(response.data.message);
                Swal.fire('Error!', response.data.message, 'error');
                return false;
            }
        } catch (err) {
            setError('Failed to delete city');
            Swal.fire('Error!', 'Failed to delete city.', 'error');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        deleteCity,
        loading,
        error,
    };
};
