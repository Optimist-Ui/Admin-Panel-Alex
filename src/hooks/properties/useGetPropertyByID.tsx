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
    city: string | null;
    ownerId: string;
    ownerType: string;
    isFeatured: boolean;
    views: number;
    createdAt: string;
}

// Custom hook for fetching a property by ID
export const useGetPropertyById = (propertyId: string) => {
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPropertyById = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const authToken = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/api/properties/${propertyId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.data.success) {
                setProperty(response.data.data || null);
            } else {
                setError(response.data.message || 'Failed to fetch property');
            }
        } catch (err) {
            setError('An error occurred while fetching the property');
        } finally {
            setLoading(false);
        }
    }, [propertyId]);

    useEffect(() => {
        if (propertyId) {
            fetchPropertyById();
        }
    }, [propertyId, fetchPropertyById]);

    return {
        property,
        loading,
        error,
        refetchProperty: fetchPropertyById, // Expose the function to refetch the property
    };
};
