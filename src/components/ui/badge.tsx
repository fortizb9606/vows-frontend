import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium';
    const variantStyles = {
      default: 'bg-blue-100 text-blue-800',
      outline: 'border border-gray-300 bg-white text-gray-700',
      secondary: 'bg-gray-100 text-gray-800',
      destructive: 'bg-red-100 text-red-800',
    };
    return <div ref={ref} className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props} />;
  }
);
Badge.displayName = 'Badge';
export { Badge };
