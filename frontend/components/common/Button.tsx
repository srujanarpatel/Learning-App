import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import Spinner from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  children: ReactNode;
}

export default function Button({ children, variant = 'primary', isLoading, className, disabled, ...props }: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 px-5 py-2.5';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 border border-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const isDisabled = disabled || isLoading;

  return (
    <button 
      className={clsx(baseClasses, variants[variant], isDisabled ? 'opacity-70 cursor-not-allowed' : '', className)}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && <Spinner className="w-5 h-5 mr-2 border-t-white" />}
      {children}
    </button>
  );
}
