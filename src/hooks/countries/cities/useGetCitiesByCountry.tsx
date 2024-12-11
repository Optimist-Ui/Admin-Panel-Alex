import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Define an interface for the city object
interface City {
    _id: string;
    name: string;
    propertyCount: number;
    imageUrl: string;
    radius: number;
    countryId: string;
    createdAt?: string; // Optional as it might not always be used
    updatedAt?: string; // Optional as it might not always be used
}

// Define the hook
export const useGetCitiesByCountry = (countryName: string) => {
    const [cities, setCities] = useState<City[]>([]); // Use City[] for type safety
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Define the fetchCities function using useCallback to avoid unnecessary re-renders
    const fetchCities = useCallback(async () => {
        if (!countryName) return; // Don't fetch if no country name is provided

        setLoading(true);
        setError(null); // Reset error before making the request

        try {
            const response = await axios.get<{ success: boolean; message: string; data: City[] }>(`${API_URL}/api/cities`, {
                params: { countryName },
            });

            if (response.data.success) {
                setCities(response.data.data); // Set the cities data
            } else {
                setError(response.data.message); // Set error message
            }
        } catch (err) {
            setError('Failed to fetch cities'); // Handle error if the request fails
        } finally {
            setLoading(false); // Set loading to false after request completes
        }
    }, [countryName]); // Refetch cities whenever countryName changes

    // Call fetchCities initially when the countryName changes
    useEffect(() => {
        fetchCities();
    }, [fetchCities]); // Dependency on fetchCities to prevent infinite loops

    return {
        cities,
        loading,
        error,
        refetchCities: fetchCities, // Expose the function for external use
    };
};
