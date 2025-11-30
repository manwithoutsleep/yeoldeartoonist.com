import React, { useState } from 'react';

interface InfoBalloonProps {
    text: string;
}

export const InfoBalloon = ({ text }: InfoBalloonProps) => {
    const [show, setShow] = useState(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            <svg
                role="img"
                aria-label="info"
                className="w-5 h-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            {show && (
                <div className="absolute z-10 w-64 p-2 -mt-16 text-sm text-white bg-gray-900 rounded-md shadow-lg">
                    {text}
                </div>
            )}
        </div>
    );
};
