import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export type Country = {
    id: string; // We are using id, so we don't need _id in the type
    _id: string;
    name: string;
    code: string;
    createdAt: string;
    updatedAt: string;
    currency: string;

    isActive: boolean;
};

type CountriesResponse = {
    success: boolean;
    message: string;
    data: Country[]; // No change here
};

export const useCountriesListing = () => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCountries = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<CountriesResponse>(`${API_URL}/api/country/getall`);

            if (response.data.success) {
                const mappedCountries = response.data.data.map((country) => ({
                    id: country._id, // Map _id to id
                    _id: country.id, // Map _id to id
                    name: country.name,
                    code: country.code,
                    createdAt: country.createdAt,
                    updatedAt: country.updatedAt,
                    currency: country.currency,
                    isActive: country.isActive,
                }));

                setCountries(mappedCountries); // Now this will match the Country type
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Failed to fetch countries');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCountries();
    }, [fetchCountries]);

    return {
        countries,
        loading,
        error,
        refetchCountries: fetchCountries, // Expose the function for external use
    };
};
