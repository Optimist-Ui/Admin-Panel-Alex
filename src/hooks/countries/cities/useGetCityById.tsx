import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export type City = {
    _id: string;
    name: string;
    propertyCount: number;
    imageUrl: string | null;
    radius: number;
    countryId: {
        code: string;
        name: string;
        _id: string;
    };
    createdAt: string;
    updatedAt: string;
    __v: number;
};

type GetCityResponse = {
    success: boolean;
    message: string;
    data: City;
};

export const useGetCityById = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [city, setCity] = useState<City | null>(null);

    const getCityById = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<GetCityResponse>(`${API_URL}/api/cities/${id}`);
            if (response.data.success) {
                setCity(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || 'Failed to fetch city details');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        getCityById,
        loading,
        error,
        city,
    };
};

export default useGetCityById;
