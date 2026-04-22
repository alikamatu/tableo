import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  onValueChange?: (value: string) => void;
  startIcon?: React.ReactNode;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, onValueChange, startIcon, startContent, endContent, ...props }, ref) => {
    const leadingContent = startContent ?? startIcon;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-xs font-semibold text-muted-foreground ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {leadingContent && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors">
              {leadingContent}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-xl border border-border bg-bg px-4 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-all",
              leadingContent && "pl-11",
              endContent && "pr-11",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            ref={ref}
            onChange={(e) => {
              props.onChange?.(e);
              onValueChange?.(e.target.value);
            }}
            {...props}
          />
          {endContent && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors">
              {endContent}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-[10px] font-medium text-destructive ml-1">
            {error}
          </p>
        ) : hint ? (
          <p className="text-[10px] font-medium text-muted-foreground ml-1">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
