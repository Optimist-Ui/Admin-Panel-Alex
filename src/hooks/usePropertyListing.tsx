import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Environment variable for the API URL
const API_URL = import.meta.env.VITE_API_URL;

// Define the Property interface
export interface Property {
    _id: string;
    title: string;
    description: string;
    category: string[];
    status: string;
    price: number;
    type: string;
    address: string;
    latitude: number;
    longitude: number;
    size: number;
    roomSize: number;
    rooms: number;
    bedrooms: number;
    bathrooms: number;
    garages: number;
    garageSize: number;
    yearBuilt: number;
    availableFrom: string;
    basement: string;
    extraDetails: string;
    roofing: string;
    exteriorMaterial: string;
    amenities: string[];
    gallery: { src: string; alt: string; _id: string }[];
    city: string;
    ownerId: string;
    ownerType: string;
    isFeatured: boolean;
    views: number;
}

// Custom hook for fetching properties
export const usePropertyListing = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const authToken = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/api/properties`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.data.success) {
                setProperties(response.data.data?.properties || []);
            } else {
                setError(response.data.message || 'Failed to fetch properties');
            }
        } catch (err) {
            setError('An error occurred while fetching properties');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    return {
        properties,
        loading,
        error,
        refetchProperties: fetchProperties, // Expose the function to refetch properties
    };
};
