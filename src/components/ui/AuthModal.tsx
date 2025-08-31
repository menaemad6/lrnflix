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
      <DialogPrimitive.Overlay 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-300" 
      />
      <DialogPrimitive.Content
        className={
          `fixed left-1/2 top-1/2 z-50 w-full h-full sm:h-auto sm:max-w-lg -translate-x-1/2 -translate-y-1/2 
           animate-in fade-in-0 zoom-in-95 duration-300 ${className || ''}`
        }
      >
        <div className="relative w-full h-full sm:h-auto">
          {/* Premium glow effect - hidden on mobile for full screen */}
          <div className="hidden sm:block absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-xl opacity-75 animate-pulse-glow"></div>
          <div className="relative w-full h-full sm:h-auto">
            {children}
          </div>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

export default AuthModal; 