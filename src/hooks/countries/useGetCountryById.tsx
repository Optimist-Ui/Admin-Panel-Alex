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

type GetCountryResponse = {
    success: boolean;
    message: string;
    data: Country;
};

export const useGetCountryById = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [country, setCountry] = useState<Country | null>(null);

    const getCountryById = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<GetCountryResponse>(`${API_URL}/api/country/countries/${id}`);

            if (response.data.success) {
                setCountry(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Failed to fetch country details');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        getCountryById,
        loading,
        error,
        country,
    };
};
