import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'muted';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, loading, startContent, endContent, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    const variants = {
      primary: 'bg-brand text-brand-fg hover:opacity-90 active:scale-[0.98]',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]',
      muted: 'bg-muted text-muted-foreground hover:bg-muted/80 active:scale-[0.98]',
      ghost: 'bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
      danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98]',
      outline: 'bg-transparent border border-input text-foreground hover:bg-accent hover:text-accent-foreground',
    };

    const sizes = {
      sm: 'h-9 px-4 text-xs rounded-lg',
      md: 'h-11 px-6 text-sm rounded-xl font-semibold',
      lg: 'h-14 px-10 text-base rounded-2xl font-bold',
      icon: 'h-10 w-10 p-2 rounded-xl',
    };

    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={loading}
        {...props}
      >
        {loading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {startContent ? <span className="mr-2 inline-flex items-center">{startContent}</span> : null}
        {props.children}
        {endContent ? <span className="ml-2 inline-flex items-center">{endContent}</span> : null}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button };
