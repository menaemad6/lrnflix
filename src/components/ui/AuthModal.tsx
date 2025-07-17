import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange, children, className }) => (
  <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80" />
      <DialogPrimitive.Content
        className={
          `fixed left-1/2 top-1/2 z-50 w-full sm:max-w-lg -translate-x-1/2 -translate-y-1/2 border bg-background shadow-lg sm:rounded-lg ${className || ''}`
        }
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

export default AuthModal; 