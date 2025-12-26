/**
 * Paper Attempt Storage Utility
 * Manages persistent storage of paper answers and upload counts using localStorage
 * Data persists across page refreshes but is tied to specific paper attempts
 */

export interface StoredAnswer {
    questionId: number;
    answerText?: string;
    imageUrl?: string;
    extractedText?: string;
    selectedOptionId?: number;
    uploadCount: number; // Track how many times image was uploaded
    lastModified: number; // Timestamp
}

export interface PaperAttemptStorage {
    paperId: number;
    userId: number;
    answers: Map<number, StoredAnswer>;
    startedAt: number; // Timestamp when attempt started
    lastSaved: number; // Last save timestamp
}

const STORAGE_PREFIX = 'paper_attempt_';
const STORAGE_VERSION = '1.0';

/**
 * Generate storage key for a specific paper attempt
 */
function getStorageKey(paperId: number, userId: number): string {
    return `${STORAGE_PREFIX}${paperId}_${userId}_v${STORAGE_VERSION}`;
}

/**
 * Save paper attempt data to localStorage
 */
export function savePaperAttempt(
    paperId: number,
    userId: number,
    answers: Map<number, StoredAnswer>
): void {
    try {
        const data: PaperAttemptStorage = {
            paperId,
            userId,
            answers,
            startedAt: Date.now(),
            lastSaved: Date.now()
        };

        // Convert Map to Array for JSON serialization
        const serializable = {
            ...data,
            answers: Array.from(answers.entries())
        };

        const key = getStorageKey(paperId, userId);
        localStorage.setItem(key, JSON.stringify(serializable));

        console.log(`[PaperStorage] Saved attempt for paper ${paperId}, ${answers.size} answers`);
    } catch (error) {
        console.error('[PaperStorage] Failed to save:', error);
        // If localStorage is full, try to clear old attempts
        clearOldAttempts();
    }
}

/**
 * Load paper attempt data from localStorage
 */
export function loadPaperAttempt(
    paperId: number,
    userId: number
): Map<number, StoredAnswer> | null {
    try {
        const key = getStorageKey(paperId, userId);
        const stored = localStorage.getItem(key);

        if (!stored) {
            console.log(`[PaperStorage] No saved attempt found for paper ${paperId}`);
            return null;
        }

        const data = JSON.parse(stored);

        // Convert array back to Map
        const answers = new Map<number, StoredAnswer>(data.answers);

        console.log(`[PaperStorage] Loaded attempt for paper ${paperId}, ${answers.size} answers`);
        return answers;
    } catch (error) {
        console.error('[PaperStorage] Failed to load:', error);
        return null;
    }
}

/**
 * Update upload count for a specific question
 */
export function incrementUploadCount(
    paperId: number,
    userId: number,
    questionId: number
): number {
    const answers = loadPaperAttempt(paperId, userId) || new Map();
    const existing = answers.get(questionId);

    const newCount = (existing?.uploadCount || 0) + 1;

    const updated: StoredAnswer = {
        ...existing,
        questionId,
        uploadCount: newCount,
        lastModified: Date.now()
    };

    answers.set(questionId, updated);
    savePaperAttempt(paperId, userId, answers);

    return newCount;
}

/**
 * Get upload count for a specific question
 */
export function getUploadCount(
    paperId: number,
    userId: number,
    questionId: number
): number {
    const answers = loadPaperAttempt(paperId, userId);
    return answers?.get(questionId)?.uploadCount || 0;
}

/**
 * Update answer for a specific question
 */
export function updateAnswer(
    paperId: number,
    userId: number,
    questionId: number,
    answerData: Partial<StoredAnswer>
): void {
    const answers = loadPaperAttempt(paperId, userId) || new Map();
    const existing = answers.get(questionId);

    const updated: StoredAnswer = {
        questionId,
        uploadCount: existing?.uploadCount || 0,
        ...existing,
        ...answerData,
        lastModified: Date.now()
    };

    answers.set(questionId, updated);
    savePaperAttempt(paperId, userId, answers);
}

/**
 * Clear paper attempt data (call on successful submission)
 */
export function clearPaperAttempt(paperId: number, userId: number): void {
    try {
        const key = getStorageKey(paperId, userId);
        localStorage.removeItem(key);
        console.log(`[PaperStorage] Cleared attempt for paper ${paperId}`);
    } catch (error) {
        console.error('[PaperStorage] Failed to clear:', error);
    }
}

/**
 * Clear old attempts (older than 7 days) to free up space
 */
export function clearOldAttempts(): void {
    try {
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const keysToRemove: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_PREFIX)) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '{}');
                    if (data.lastSaved && data.lastSaved < sevenDaysAgo) {
                        keysToRemove.push(key);
                    }
                } catch (e) {
                    // Invalid data, mark for removal
                    keysToRemove.push(key);
                }
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log(`[PaperStorage] Cleared ${keysToRemove.length} old attempts`);
    } catch (error) {
        console.error('[PaperStorage] Failed to clear old attempts:', error);
    }
}

/**
 * Get all answers for a paper attempt
 */
export function getAllAnswers(
    paperId: number,
    userId: number
): Map<number, StoredAnswer> {
    return loadPaperAttempt(paperId, userId) || new Map();
}
