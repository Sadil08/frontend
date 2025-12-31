"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { PaperBundleSummaryDto } from '@/types';

/**
 * Props for PublicBundleCard component
 */
interface PublicBundleCardProps {
    /** Public bundle data */
    bundle: PaperBundleSummaryDto;
}

/**
 * PublicBundleCard Component
 * Displays bundle information for public listings (no purchase data)
 */
import { useCart } from '@/context/CartContext';
import { Button, message } from 'antd';
import { ShoppingCartOutlined, CheckOutlined } from '@ant-design/icons';

/**
 * PublicBundleCard Component
 * Displays bundle information for public listings (no purchase data)
 */
export const PublicBundleCard: React.FC<PublicBundleCardProps> = ({ bundle }) => {
    const router = useRouter();
    const { addToCart, items } = useCart();

    const handleClick = () => {
        router.push(`/bundles/${bundle.id}/papers`);
    };

    const isInCart = items.some(item => item.id === bundle.id);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isInCart) {
            router.push('/cart');
            return;
        }

        await addToCart({
            id: bundle.id,
            name: bundle.name,
            price: typeof bundle.price === 'number' ? bundle.price : 0,
            description: bundle.description
        });
    };

    return (
        <div
            onClick={handleClick}
            className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border border-secondary-200 flex flex-col h-full overflow-hidden"
        >
            <div className="p-6 flex-grow">
                <div className="flex gap-2 mb-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-primary-50 text-primary-700 uppercase tracking-wide">
                        {bundle.examType}
                    </span>
                    {bundle.isPastPaper && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 uppercase tracking-wide">
                            Past Paper
                        </span>
                    )}
                </div>

                <h3 className="text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {bundle.name}
                </h3>
                <p className="text-secondary-600 text-sm line-clamp-3 mb-4">
                    {bundle.description}
                </p>
            </div>

            <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-100 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-xs text-secondary-500 font-medium uppercase">Price</span>
                    <span className="text-lg font-bold text-green-600">
                        ${typeof bundle.price === 'number' ? bundle.price.toFixed(2) : '0.00'}
                    </span>
                </div>
                <Button
                    type={isInCart ? "default" : "primary"}
                    icon={isInCart ? <CheckOutlined /> : <ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                    className={`flex items-center ${isInCart ? 'text-green-600 border-green-600 hover:text-green-700 hover:border-green-700' : 'bg-primary-600 hover:bg-primary-700 border-none'}`}
                >
                    {isInCart ? 'In Cart' : 'Add to Cart'}
                </Button>
            </div>
        </div>
    );
};
