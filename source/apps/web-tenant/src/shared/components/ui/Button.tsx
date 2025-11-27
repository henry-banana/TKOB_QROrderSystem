import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-sm active:scale-[0.98]',
    secondary: 'bg-white text-emerald-500 border-2 border-emerald-500 hover:bg-emerald-50 active:scale-[0.98]',
    tertiary: 'bg-transparent text-emerald-500 hover:bg-emerald-50 active:scale-[0.98]'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
