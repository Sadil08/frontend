import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const cartService = {
    getCart: async () => {
        const response = await axios.get(`${API_URL}/carts`, {
            headers: getAuthHeader(),
        });
        // Assuming one active cart per user for simplicity
        return response.data[0] || { bundleIds: [] };
    },

    addToCart: async (bundleId: number) => {
        // Simplified: fetching current cart, adding, updating
        // Real impl would depend on backend cart logic
        const cart = await cartService.getCart();
        const currentIds = JSON.parse(cart.bundleIds || '[]');
        if (!currentIds.includes(bundleId)) {
            const updatedIds = JSON.stringify([...currentIds, bundleId]);
            // Assuming POST creates/updates
            const response = await axios.post(`${API_URL}/carts`, { ...cart, bundleIds: updatedIds }, {
                headers: getAuthHeader(),
            });
            return response.data;
        }
        return cart;
    },

    removeFromCart: async (bundleId: number) => {
        const cart = await cartService.getCart();
        const currentIds = JSON.parse(cart.bundleIds || '[]');
        const updatedIds = JSON.stringify(currentIds.filter((id: number) => id !== bundleId));
        const response = await axios.post(`${API_URL}/carts`, { ...cart, bundleIds: updatedIds }, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    checkout: async () => {
        // Placeholder for payment integration
        // In real app, this would call payment gateway
        // Then grant access via backend
        return new Promise((resolve) => setTimeout(resolve, 1000));
    }
};
