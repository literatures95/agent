import * as React from 'react';

interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
  placement?: 'top' | 'right' | 'bottom' | 'left';
}

export function Tooltip({ content, placement = 'top', className = '', ...props }: TooltipProps) {
  return (
    <div
      className={`group relative inline-block ${className}`}
      {...props}
    >
      {props.children}
      <div className={`absolute z-50 hidden group-hover:block bg-popover text-popover-foreground text-sm rounded-md px-3 py-1.5 shadow-md pointer-events-none ${
        placement === 'top' ? 'bottom-full left-1/2 transform -translate-x-1/2 mb-1' :
        placement === 'bottom' ? 'top-full left-1/2 transform -translate-x-1/2 mt-1' :
        placement === 'left' ? 'right-full top-1/2 transform -translate-y-1/2 mr-1' :
        'left-full top-1/2 transform -translate-y-1/2 ml-1'
      }`}>
        {content}
        <div className={`absolute w-2 h-2 bg-popover rotate-45 ${
          placement === 'top' ? 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2' :
          placement === 'bottom' ? 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2' :
          placement === 'left' ? 'right-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2' :
          'left-0 top-1/2 transform -translate-y-1/2 translate-x-1/2'
        }`} />
      </div>
    </div>
  );
}