/**
 * Batch Extraction Service
 * Utility for batch processing multiple images with AI extraction
 * Use this for admin operations like creating papers with multiple questions
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface BatchExtractionItem {
    id: string;
    file: File;
}

export interface BatchExtractionResult {
    id: string;
    extractedText: string;
    imageUrl: string;
}

export interface BatchExtractionResponse {
    results: BatchExtractionResult[];
    totalProcessed: number;
}

/**
 * Extract text from multiple images in a single API call.
 * Reduces API overhead compared to individual calls.
 * 
 * @param items Array of {id, file} pairs
 * @param subject Optional subject for specialized extraction
 * @returns Promise with extraction results
 */
export async function extractBatch(
    items: BatchExtractionItem[],
    subject?: string
): Promise<BatchExtractionResponse> {
    const formData = new FormData();

    // Add all files
    items.forEach(item => {
        formData.append('files', item.file);
    });

    // Add comma-separated IDs
    const ids = items.map(item => item.id).join(',');
    formData.append('ids', ids);

    // Add subject if provided
    if (subject) {
        formData.append('subject', subject);
    }

    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/api/questions/extract-batch`, {
        method: 'POST',
        headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Batch extraction failed');
    }

    return response.json();
}

/**
 * Helper to extract text from multiple files with progress callback.
 * 
 * @param files Array of files to process
 * @param subject Optional subject
 * @param onProgress Progress callback (0-100)
 */
export async function extractBatchWithProgress(
    files: File[],
    subject?: string,
    onProgress?: (percent: number) => void
): Promise<BatchExtractionResult[]> {
    // Create items with auto-generated IDs
    const items: BatchExtractionItem[] = files.map((file, index) => ({
        id: `q${index + 1}`,
        file
    }));

    onProgress?.(10); // Started

    const response = await extractBatch(items, subject);

    onProgress?.(100); // Complete

    return response.results;
}
