import React from 'react';

export function AnatomicalHeart({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Main Body */}
            <path d="M12 21c-4-3-8-6-8-10.5 0-3 2.5-5.5 5.5-5.5 1.5 0 3 1 4 2.5 1-1.5 2.5-2.5 4-2.5 3 0 5.5 2.5 5.5 5.5 0 4.5-4 7.5-8 10.5z" />

            {/* Aorta and Vessels */}
            <path d="M13.5 6.5s.5-3.5-1.5-4.5" />
            <path d="M15 7s1.5-3 0-4.5" />
            <path d="M11 7S9.5 4 10 3" />

            {/* Internal Structures/Veins */}
            <path d="M12 10c0 3-1 6-4 8" />
            <path d="M12 10c0 3 2 5 5 7" />
            <path d="M9 10c-.5 2-1.5 4-3 5" />
            <path d="M15 10c.5 2 1.5 4 3 5" />

            {/* Top Details */}
            <path d="M10.5 8c0-1 .5-2 1.5-2s1.5 1 1.5 2" />
        </svg>
    );
}
