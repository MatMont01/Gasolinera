import React from 'react';

const Button: React.FC<{ onClick: () => void, text: string, color?: string }> = ({ onClick, text, color = 'blue' }) => {
    const bgColor = color === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700';
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 ${bgColor} text-white rounded-md transition`}
        >
            {text}
        </button>
    );
};

export default Button;
