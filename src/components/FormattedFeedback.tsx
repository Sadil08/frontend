"use client";

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface FormattedFeedbackProps {
    content: string;
    className?: string;
}

/**
 * FormattedFeedback Component
 * Renders AI feedback with proper markdown formatting and math (KaTeX) rendering.
 * Handles:
 * - Bold/italic text (**bold**, *italic*)
 * - Inline code (`code`)
 * - Line breaks (\n)
 * - Math expressions ($inline$ and $$block$$)
 * - Bullet lists
 * - Headers
 */
export const FormattedFeedback: React.FC<FormattedFeedbackProps> = ({ content, className = '' }) => {
    const processedContent = useMemo(() => {
        if (!content) return '';

        let text = content;

        // Convert literal \n sequences (escaped newlines from JSON) to actual newlines
        text = text.replace(/\\n/g, '\n');
        // Convert literal \t to spaces
        text = text.replace(/\\t/g, '    ');

        // Convert backtick-wrapped math expressions to KaTeX $..$ format
        // e.g. `x^2 + y^2 = 17` → $x^2 + y^2 = 17$ (only for math-like content)
        text = text.replace(/`([^`]*[+\-*/^=√∫∑≤≥≠×÷][^`]*)`/g, '$$$1$$');

        return text;
    }, [content]);

    return (
        <div className={`formatted-feedback prose prose-sm max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    // Style paragraphs
                    p: ({ children }) => (
                        <p className="text-gray-700 leading-relaxed mb-2 last:mb-0">{children}</p>
                    ),
                    // Style bold text
                    strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">{children}</strong>
                    ),
                    // Style inline code
                    code: ({ children }) => (
                        <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                    ),
                    // Style lists
                    ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li className="text-gray-700">{children}</li>
                    ),
                    // Style headers
                    h1: ({ children }) => (
                        <h3 className="text-base font-bold text-gray-900 mt-3 mb-1">{children}</h3>
                    ),
                    h2: ({ children }) => (
                        <h4 className="text-sm font-bold text-gray-800 mt-2 mb-1">{children}</h4>
                    ),
                    h3: ({ children }) => (
                        <h5 className="text-sm font-semibold text-gray-800 mt-2 mb-1">{children}</h5>
                    ),
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    );
};
