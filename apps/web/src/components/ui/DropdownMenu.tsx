'use client';

import { createContext, useContext, useRef, useEffect, useState, ReactNode } from 'react';

interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  close: () => void;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within DropdownMenu');
  }
  return context;
};

interface DropdownMenuProps {
  children: ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, close: () => setIsOpen(false) }}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

interface DropdownMenuTriggerProps {
  children: ReactNode;
  className?: string;
}

export function DropdownMenuTrigger({ children, className }: DropdownMenuTriggerProps) {
  const { isOpen, setIsOpen } = useDropdown();

  return (
    <button
      className={className}
      onClick={() => setIsOpen(!isOpen)}
      aria-haspopup="menu"
      aria-expanded={isOpen}
    >
      {children}
    </button>
  );
}

interface DropdownMenuContentProps {
  children: ReactNode;
  align?: 'start' | 'end';
  className?: string;
}

export function DropdownMenuContent({ children, align = 'start', className = '' }: DropdownMenuContentProps) {
  const { isOpen, close } = useDropdown();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        close();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  const alignClass = align === 'end' ? 'right-0' : 'left-0';

  return (
    <div
      ref={contentRef}
      className={`absolute top-full ${alignClass} mt-2 z-50 bg-surface ${className}`}
      role="menu"
    >
      {children}
    </div>
  );
}

interface DropdownMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  asChild?: boolean;
  className?: string;
}

export function DropdownMenuItem({
  children,
  onClick,
  asChild,
  className = '',
}: DropdownMenuItemProps) {
  const { close } = useDropdown();

  const handleClick = () => {
    onClick?.();
    close();
  };

  if (asChild) {
    return (
      <div
        onClick={handleClick}
        className={className}
        role="menuitem"
      >
        {children}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={className}
      role="menuitem"
    >
      {children}
    </button>
  );
}

interface DropdownMenuLabelProps {
  children: ReactNode;
  className?: string;
}

export function DropdownMenuLabel({ children, className = '' }: DropdownMenuLabelProps) {
  return (
    <div className={className} role="menuitem" aria-disabled>
      {children}
    </div>
  );
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

export function DropdownMenuSeparator({ className = '' }: DropdownMenuSeparatorProps) {
  return <div className={`h-px bg-border my-1 ${className}`} role="separator" />;
}
