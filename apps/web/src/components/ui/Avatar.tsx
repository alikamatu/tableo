import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  name?: string | null;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const avatarSizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'h-7 w-7',
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
};

function getInitials(name?: string | null) {
  if (!name) return '—';

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(
  ({ className, name, src, size = 'md', ...props }, ref) => (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-full bg-muted text-muted-foreground',
        avatarSizeClasses[size],
        className,
      )}
      {...props}
    >
      {src ? (
        <AvatarPrimitive.Image
          className="h-full w-full object-cover"
          src={src}
          alt={name ?? 'Avatar'}
        />
      ) : null}
      <AvatarPrimitive.Fallback
        className="flex h-full w-full items-center justify-center bg-muted text-xs font-semibold uppercase text-fg"
        delayMs={600}
      >
        {getInitials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
);

Avatar.displayName = 'Avatar';

export { Avatar };
