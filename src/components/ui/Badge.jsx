import React from 'react';

export const Badge = ({ children, variant = 'default', className = '', style }) => (
  <span 
    className={`px-2 py-1 rounded-full text-xs font-medium ${
      variant === 'outline' 
        ? 'border bg-transparent' 
        : 'bg-gray-100 text-gray-800'
    } ${className}`}
    style={style}
  >
    {children}
  </span>
);