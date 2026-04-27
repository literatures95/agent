import * as React from 'react';
import { cva } from 'class-variance-authority';

const avatarVariants = cva(
  "inline-flex items-center justify-center rounded-full font-normal text-sm bg-muted text-muted-foreground",
  {
    variants: {
      size: {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
        xl: "w-16 h-16",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-md",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "circle",
    },
  }
);

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  src?: string;
  alt?: string;
}

export function Avatar({ className = "", size = "md", shape = "circle", src, alt = "", ...props }: AvatarProps) {
  const content = src ? (
    <img src={src} alt={alt} className="w-full h-full object-cover" />
  ) : (
    <div {...props} />
  );

  return (
    <div className={avatarVariants({ size, shape, className })} {...props}>
      {content}
    </div>
  );
}

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
}

export function AvatarGroup({ className = "", max = 3, children, ...props }: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children);
  const visibleCount = Math.min(max, childrenArray.length);
  const overflowCount = childrenArray.length - visibleCount;

  return (
    <div className={`flex -space-x-2 ${className}`} {...props}>
      {childrenArray.slice(0, visibleCount).map((child, index) => (
        <React.Fragment key={index}>
          {child}
        </React.Fragment>
      ))}
      {overflowCount > 0 && (
        <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground border-2 border-background flex items-center justify-center text-sm font-medium">
          +{overflowCount}
        </div>
      )}
    </div>
  );
}