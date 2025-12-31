import { useState, useEffect } from 'react';

export interface UploadLimitInfo {
    canUpload: boolean;
    remaining: number;
    isLastUpload: boolean;
    message: string;
    currentCount: number;
    maxCount: number;
}

export function useUploadLimit(
    currentCount: number = 0,
    maxCount: number = 2
): UploadLimitInfo {
    const [info, setInfo] = useState<UploadLimitInfo>({
        canUpload: true,
        remaining: maxCount,
        isLastUpload: false,
        message: '',
        currentCount: 0,
        maxCount: maxCount
    });

    useEffect(() => {
        const remaining = maxCount - currentCount;
        const canUpload = remaining > 0;
        const isLastUpload = remaining === 1;

        let message = '';
        if (!canUpload) {
            message = 'Upload limit reached';
        } else if (isLastUpload) {
            message = 'Last upload remaining';
        } else {
            message = `${remaining} upload${remaining > 1 ? 's' : ''} remaining`;
        }

        setInfo({
            canUpload,
            remaining,
            isLastUpload,
            message,
            currentCount,
            maxCount
        });
    }, [currentCount, maxCount]);

    return info;
}
