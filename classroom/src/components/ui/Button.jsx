import React from 'react';

const Button = ({ children, onClick, variant = 'primary', disabled = false }) => {
    return (
        <button
            className={`btn btn-${variant}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
