import React, { useEffect, useState } from 'react';

/**
 * Props for Timer component
 */
interface TimerProps {
    /** Duration in minutes */
    durationMinutes: number;
    /** Callback when timer expires */
    onExpire?: () => void;
    /** Warning threshold in minutes (default: 5) */
    warningThresholdMinutes?: number;
}

/**
 * Timer Component
 * Displays a countdown timer with visual progress and warning states
 * Features:
 * - Circular progress indicator
 * - Warning color when time is running low
 * - Auto-expire callback
 * - Formatted time display (MM:SS)
 */
export const Timer: React.FC<TimerProps> = ({
    durationMinutes,
    onExpire,
    warningThresholdMinutes = 5
}) => {
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
    const totalSeconds = durationMinutes * 60;

    useEffect(() => {
        if (timeLeft <= 0) {
            onExpire?.();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onExpire]);

    // Calculate progress percentage
    const progress = (timeLeft / totalSeconds) * 100;
    const isWarning = timeLeft <= warningThresholdMinutes * 60;

    // Format time as MM:SS
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Calculate circle dash array for SVG animation
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className={`
      flex items-center gap-3 px-4 py-2 rounded-lg border shadow-sm transition-colors duration-300
      ${isWarning
                ? 'bg-red-50 border-red-200 text-red-700 animate-pulse'
                : 'bg-white border-gray-200 text-gray-700'
            }
    `}>
            {/* Circular Progress */}
            <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="20"
                        cy="20"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        className="opacity-20"
                    />
                    <circle
                        cx="20"
                        cy="20"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>

            {/* Time Display */}
            <div className="flex flex-col">
                <span className="text-xs font-medium uppercase opacity-70">
                    Time Remaining
                </span>
                <span className="text-xl font-bold font-mono leading-none">
                    {formattedTime}
                </span>
            </div>
        </div>
    );
};
