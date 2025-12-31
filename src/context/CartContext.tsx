"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import axios from 'axios';

interface Bundle {
    id: number;
    name: string;
    price: number;
    description: string;
}

interface CartContextType {
    items: Bundle[];
    addToCart: (bundle: Bundle) => Promise<void>;
    removeFromCart: (id: number) => Promise<void>;
    clearCart: () => void;
    cartCount: number;
    total: number;
    loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<Bundle[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token')?.trim();
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await axios.get('http://localhost:8080/api/carts/my-cart', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && response.data.bundles) {
                setItems(response.data.bundles);
            }
        } catch (error) {
            console.error("Failed to fetch cart", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const addToCart = async (bundle: Bundle) => {
        try {
            const token = localStorage.getItem('token')?.trim();
            if (!token) {
                message.error("Please login to add to cart");
                return;
            }

            await axios.post(`http://localhost:8080/api/carts/my-cart/items/${bundle.id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setItems(prev => {
                if (prev.some(item => item.id === bundle.id)) return prev;
                return [...prev, bundle];
            });
            message.success("Added to cart");
        } catch (error) {
            console.error("Failed to add to cart", error);
            message.error("Failed to add to cart");
        }
    };

    const removeFromCart = async (id: number) => {
        try {
            const token = localStorage.getItem('token')?.trim();
            if (!token) return;

            await axios.delete(`http://localhost:8080/api/carts/my-cart/items/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setItems(prev => prev.filter(item => item.id !== id));
            message.success("Removed from cart");
        } catch (error) {
            console.error("Failed to remove from cart", error);
            message.error("Failed to remove from cart");
        }
    };

    const clearCart = () => {
        setItems([]);
    };

    const total = items.reduce((sum, item) => sum + item.price, 0);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            clearCart,
            cartCount: items.length,
            total,
            loading
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
