"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { PaperBundleSummaryDto } from '@/types';
import { useCart } from '@/context/CartContext';
import { ShoppingCartOutlined, CheckOutlined } from '@ant-design/icons';

interface PublicBundleCardProps {
    bundle: PaperBundleSummaryDto;
}

const TYPE_STRIP: Record<string, string> = {
    MCQ:   'bg-blue-500',
    ESSAY: 'bg-emerald-500',
    MIXED: 'bg-purple-500',
};

const TYPE_LABEL: Record<string, { bg: string; text: string }> = {
    MCQ:   { bg: 'bg-blue-50',    text: 'text-blue-700'    },
    ESSAY: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    MIXED: { bg: 'bg-purple-50',  text: 'text-purple-700'  },
};

export const PublicBundleCard: React.FC<PublicBundleCardProps> = ({ bundle }) => {
    const router = useRouter();
    const { addToCart, items } = useCart();
    const isInCart = items.some(item => item.id === bundle.id);

    const strip = TYPE_STRIP[bundle.type] || 'bg-indigo-500';
    const label = TYPE_LABEL[bundle.type] || TYPE_LABEL.MCQ;

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isInCart) { router.push('/cart'); return; }
        await addToCart({
            id: bundle.id,
            name: bundle.name,
            price: typeof bundle.price === 'number' ? bundle.price : 0,
            description: bundle.description,
        });
    };

    return (
        <div
            onClick={() => router.push(`/bundles/${bundle.id}/papers`)}
            className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer flex flex-col h-full overflow-hidden"
        >
            {/* Coloured type strip */}
            <div className={`h-1.5 w-full ${strip}`} />

            <div className="p-5 flex-grow flex flex-col">
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {bundle.examType && (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 uppercase tracking-wide">
                            {bundle.examType}
                        </span>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wide ${label.bg} ${label.text}`}>
                        {bundle.type}
                    </span>
                    {bundle.isPastPaper && (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 uppercase tracking-wide">
                            Past Paper
                        </span>
                    )}
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                    {bundle.name}
                </h3>

                <p className="text-sm text-gray-500 line-clamp-2 flex-grow leading-relaxed">
                    {bundle.description}
                </p>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                <div>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide block leading-tight">Price</span>
                    <span className="text-lg font-bold text-green-600">
                        ${typeof bundle.price === 'number' ? bundle.price.toFixed(2) : '0.00'}
                    </span>
                </div>

                <button
                    onClick={handleAddToCart}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        isInCart
                            ? 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md'
                    }`}
                >
                    {isInCart ? (
                        <><CheckOutlined /> In Cart</>
                    ) : (
                        <><ShoppingCartOutlined /> Add to Cart</>
                    )}
                </button>
            </div>
        </div>
    );
};
