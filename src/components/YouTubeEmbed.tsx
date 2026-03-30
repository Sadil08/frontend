'use client';

import React from 'react';

interface YouTubeEmbedProps {
    videoUrl: string;
    title?: string;
}

/**
 * Extracts YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
function extractYouTubeId(url: string): string | null {
    if (!url) return null;

    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

/**
 * Reusable YouTube embed component.
 * Embeds YouTube videos in a responsive iframe.
 * Views count towards YouTube channel analytics.
 */
export default function YouTubeEmbed({ videoUrl, title = 'Paper Explanation Video' }: YouTubeEmbedProps) {
    const videoId = extractYouTubeId(videoUrl);

    if (!videoId) {
        return null;
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;

    return (
        <div style={{
            position: 'relative',
            paddingBottom: '56.25%', // 16:9 aspect ratio
            height: 0,
            overflow: 'hidden',
            maxWidth: '100%',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}>
            <iframe
                src={embedUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                }}
            />
        </div>
    );
}
