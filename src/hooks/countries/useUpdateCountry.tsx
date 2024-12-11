import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export type Country = {
    id: string;
    _id: string;
    name: string;
    code: string;
    createdAt: string;
    updatedAt: string;
    currency: string;
    isActive: boolean;
};

type UpdateCountryResponse = {
    success: boolean;
    message: string;
    data: Country;
};

export const useUpdateCountry = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [updatedCountry, setUpdatedCountry] = useState<Country | null>(null);

    const updateCountry = useCallback(async (id: string, updatedData: Partial<Country>) => {
        setLoading(true);
        setError(null);

        console.log(updatedData);
        try {
            const response = await axios.put<UpdateCountryResponse>(`${API_URL}/api/country/countries/${id}`, updatedData);

            if (response.data.success) {
                setUpdatedCountry(response.data.data);
                return true; // Signal success
            } else {
                setError(response.data.message);
                return false;
            }
        } catch (err) {
            setError('Failed to update country');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        updateCountry,
        loading,
        error,
        updatedCountry,
    };
};
