import React from 'react';
import { AlertCircle } from 'lucide-react';
import { FieldError } from 'react-hook-form';

interface FormErrorProps {
  error?: FieldError;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`flex items-center gap-2 text-red-600 text-sm mt-1.5 ${className}`}>
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span className="font-medium">{error.message}</span>
    </div>
  );
};
