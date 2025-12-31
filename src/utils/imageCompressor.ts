/**
 * Image Compression Utility
 * Compresses images client-side before upload to reduce API costs and improve performance
 */

export interface CompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface CompressionResult {
    file: File;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.85,
    format: 'image/jpeg'
};

/**
 * Compresses an image file
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise with compressed file and compression stats
 */
export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<CompressionResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const originalSize = file.size;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;

                if (width > opts.maxWidth! || height > opts.maxHeight!) {
                    const ratio = Math.min(
                        opts.maxWidth! / width,
                        opts.maxHeight! / height
                    );
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                // Draw image with optimal settings for text clarity
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Compression failed'));
                            return;
                        }

                        const compressedSize = blob.size;
                        const compressionRatio = calculateCompressionRatio(originalSize, compressedSize);

                        // Create new file
                        const compressedFile = new File(
                            [blob],
                            file.name,
                            {
                                type: opts.format,
                                lastModified: Date.now()
                            }
                        );

                        resolve({
                            file: compressedFile,
                            originalSize,
                            compressedSize,
                            compressionRatio
                        });
                    },
                    opts.format,
                    opts.quality
                );
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Calculate compression ratio as percentage
 */
export function calculateCompressionRatio(
    originalSize: number,
    compressedSize: number
): number {
    return Math.round((1 - compressedSize / originalSize) * 100);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Predefined compression presets for different use cases
 */
export const COMPRESSION_PRESETS = {
    // For printed questions (high quality needed)
    QUESTION: {
        maxWidth: 2048,
        maxHeight: 2048,
        quality: 0.90,
        format: 'image/jpeg' as const
    },

    // For handwritten answers (balanced quality/size)
    ANSWER: {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
        format: 'image/jpeg' as const
    },

    // For diagrams/sketches (preserve line clarity)
    DIAGRAM: {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.80,
        format: 'image/png' as const
    },

    // For model answers
    MODEL_ANSWER: {
        maxWidth: 2048,
        maxHeight: 2048,
        quality: 0.88,
        format: 'image/jpeg' as const
    }
} as const;
