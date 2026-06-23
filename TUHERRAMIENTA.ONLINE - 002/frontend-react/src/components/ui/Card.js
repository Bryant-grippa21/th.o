import React from 'react';

export const Card = ({ children, className = '', style }) => (
  <div className={`rounded-lg border ${className}`} style={style}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '', style }) => (
  <div className={`p-4 ${className}`} style={style}>
    {children}
  </div>
);