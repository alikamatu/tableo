'use client';

import * as React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from './Modal';
import { Button } from './Button';

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void> | void;
  variant?: 'danger' | 'warning' | 'info';
  confirmText?: string;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  variant = 'danger',
  confirmText = 'Confirm',
}: ConfirmModalProps) {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const variantStyles = {
    danger: 'bg-destructive/10 text-destructive',
    warning: 'bg-amber-500/10 text-amber-500',
    info: 'bg-primary/10 text-primary',
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-[400px]">
        <ModalHeader className="flex flex-col items-center gap-4 text-center">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${variantStyles[variant]}`}
          >
            <AlertTriangle size={24} />
          </div>
          <ModalTitle className="text-xl font-bold">{title}</ModalTitle>
        </ModalHeader>
        <div className="text-muted-foreground py-2 text-center text-sm font-medium">
          {description}
        </div>
        <ModalFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="muted"
            className="w-full sm:flex-1"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            className="w-full sm:flex-1"
            onClick={handleConfirm}
            disabled={loading}
            startContent={loading && <Loader2 size={16} className="animate-spin" />}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
