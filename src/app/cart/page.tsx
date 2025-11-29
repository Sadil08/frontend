"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, message, Spin, Empty } from 'antd';
import { cartService } from '@/services/cartService';
import { bundleService } from '@/services/bundleService';
import { CartItem } from '@/components/CartItem';
import Header from '@/components/Header';

export default function CartPage() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);

    const fetchCart = async () => {
        try {
            const cart = await cartService.getCart();
            const bundleIds = JSON.parse(cart.bundleIds || '[]');

            if (bundleIds.length > 0) {
                // Fetch details for each bundle
                const items = await Promise.all(
                    bundleIds.map((id: number) => bundleService.getBundle(id))
                );
                setCartItems(items);
            } else {
                setCartItems([]);
            }
        } catch (error) {
            message.error('Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleRemove = async (id: number) => {
        try {
            await cartService.removeFromCart(id);
            message.success('Item removed');
            fetchCart(); // Refresh
        } catch (error) {
            message.error('Failed to remove item');
        }
    };

    const handleCheckout = async () => {
        setCheckingOut(true);
        try {
            await cartService.checkout();
            message.success('Purchase successful! Access granted.');
            router.push('/dashboard');
        } catch (error) {
            message.error('Checkout failed');
        } finally {
            setCheckingOut(false);
        }
    };

    const total = cartItems.reduce((sum, item) => sum + item.price, 0);

    if (loading) return <div className="flex justify-center p-12"><Spin size="large" /></div>;

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

                {cartItems.length === 0 ? (
                    <div className="card text-center py-12">
                        <Empty description="Your cart is empty" />
                        <Button type="primary" onClick={() => router.push('/')} className="mt-4 btn-primary">
                            Browse Bundles
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <CartItem key={item.id} item={item} onRemove={handleRemove} />
                            ))}
                        </div>

                        <div className="card bg-blue-50 border-blue-100">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-xl font-semibold text-gray-700">Total</span>
                                <span className="text-3xl font-bold text-blue-600">${total.toFixed(2)}</span>
                            </div>
                            <Button
                                type="primary"
                                size="large"
                                block
                                onClick={handleCheckout}
                                loading={checkingOut}
                                className="btn-primary h-12 text-lg"
                            >
                                Proceed to Checkout
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
