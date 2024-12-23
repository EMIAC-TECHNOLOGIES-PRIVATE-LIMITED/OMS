import React, { memo } from 'react';

interface ButtonProps {
    label?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    [key: string]: any;
}

const Button: React.FC<ButtonProps> = ({
    label,
    icon,
    onClick,
    className = '',
    type = 'button',
    disabled = false,
    ...rest
}) => {
    const baseClasses =
        'flex items-center px-3 py-1 bg-brand text-white rounded-md shadow-sm hover:bg-brand-light transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-dark';

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseClasses} ${className}`}
            disabled={disabled}
            {...rest}
        >
            {icon && <span className="mr-1">{icon}</span>}
            {label}
        </button>
    );
};

export default memo(Button);
