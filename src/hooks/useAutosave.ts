import { useEffect, useRef } from 'react';

interface UseAutosaveOptions {
    /**
     * Autosave interval in milliseconds
     * @default 30000 (30 seconds)
     */
    interval?: number;

    /**
     * Whether autosave is enabled
     * @default true
     */
    enabled?: boolean;
}

/**
 * Hook to automatically save data at regular intervals
 * 
 * @param saveFunction - Async function to call for saving
 * @param data - Data to save (any serializable object)
 * @param options - Autosave options
 * 
 * @example
 * useAutosave(
 *   async () => await saveDraftAnswers(attemptId, answers),
 *   answers,
 *   { interval: 30000 }
 * );
 */
export function useAutosave<T>(
    saveFunction: () => Promise<void>,
    data: T,
    options: UseAutosaveOptions = {}
) {
    const { interval = 30000, enabled = true } = options;
    const lastSavedData = useRef<T>(data);
    const isSaving = useRef(false);

    useEffect(() => {
        if (!enabled) return;

        const timer = setInterval(async () => {
            // Check if data has changed
            const dataChanged = JSON.stringify(data) !== JSON.stringify(lastSavedData.current);

            if (dataChanged && !isSaving.current) {
                isSaving.current = true;
                try {
                    await saveFunction();
                    lastSavedData.current = data;
                    console.log(`✅ Autosaved at ${new Date().toLocaleTimeString()}`);
                } catch (error) {
                    console.error('❌ Autosave failed:', error);
                } finally {
                    isSaving.current = false;
                }
            }
        }, interval);

        return () => clearInterval(timer);
    }, [data, saveFunction, interval, enabled]);
}
