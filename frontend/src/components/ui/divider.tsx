import * as React from 'react';

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

export function Divider({
  className = '',
  orientation = 'horizontal',
  size = 'md',
  ...props
}: DividerProps) {
  const sizeClasses = {
    sm: 'border-t',
    md: 'border-t-2',
    lg: 'border-t-4',
  };

  return (
    <div
      className={`${
        orientation === 'horizontal'
          ? `${sizeClasses[size]} w-full my-4 border-muted-foreground/20`
          : 'border-l-2 h-full mx-4 border-muted-foreground/20'
      } ${className}`}
      {...props}
    />
  );
}