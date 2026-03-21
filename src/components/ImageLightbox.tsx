"use client";

import React, { useState, useCallback } from 'react';

interface ImageLightboxProps {
    src: string;
    alt: string;
    className?: string;
    style?: React.CSSProperties;
    onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * ImageLightbox Component
 * Wraps an image that can be clicked/tapped to open full-size in a modal overlay.
 */
export const ImageLightbox: React.FC<ImageLightboxProps> = ({
    src,
    alt,
    className = '',
    style,
    onError
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const openLightbox = useCallback(() => setIsOpen(true), []);
    const closeLightbox = useCallback(() => setIsOpen(false), []);

    return (
        <>
            {/* Thumbnail */}
            <img
                src={src}
                alt={alt}
                className={`${className} cursor-pointer hover:opacity-90 transition-opacity`}
                style={style}
                onClick={openLightbox}
                onError={onError}
                title="Click to enlarge"
            />

            {/* Lightbox Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
                    onClick={closeLightbox}
                >
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white text-2xl transition-colors"
                        aria-label="Close"
                    >
                        ✕
                    </button>

                    {/* Full-size Image */}
                    <img
                        src={src}
                        alt={alt}
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
};
