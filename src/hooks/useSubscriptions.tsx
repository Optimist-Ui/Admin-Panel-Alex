import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export type Subscription = {
    id: string;
    name: string;
    status: string;
    price: number;
    duration: string;
    description: string;
    features: string[];
};

type SubscriptionsResponse = {
    success: boolean;
    message: string;
    data: {
        subscriptions: {
            _id: string;
            name: string;
            status: string;
            price: number;
            duration: string;
            description: string;
            features: string[];
        }[]; // Array of subscription objects
        totalSubscriptions: number;
        totalPages: number;
        currentPage: number;
    };
};

export const useSubscriptionListing = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscriptions = useCallback(async () => {
        const authToken = localStorage.getItem('authToken');
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<SubscriptionsResponse>(`${API_URL}/api/plans/`);

            if (response.data.success) {
                const subscriptionData = response.data.data; // The correct data is inside the `data` field

                // Make sure subscriptionData is an array and contains the expected objects
                if (Array.isArray(subscriptionData) && subscriptionData.length > 0) {
                    const mappedSubscriptions = subscriptionData.map((subscription) => ({
                        id: subscription._id,
                        name: subscription.name,
                        status: subscription.status,
                        price: subscription.price,
                        duration: subscription.duration,
                        description: subscription.description,
                        features: subscription.features, // Ensure you map features if available
                    }));
                    setSubscriptions(mappedSubscriptions);
                } else {
                    setError('No subscriptions found');
                }
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Failed to fetch subscriptions');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    return {
        subscriptions,
        loading,
        error,
        refetchSubscriptions: fetchSubscriptions,
    };
};
