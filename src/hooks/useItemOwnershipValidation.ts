import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import type { RootState } from '@/store/store';

export interface UseItemOwnershipValidationOptions {
  redirectTo?: string;
  showToast?: boolean;
  toastTitle?: string;
  toastDescription?: string;
}

/**
 * Reusable hook for item ownership validation
 * Checks if the current logged-in user owns the item
 * If not owned, shows toast and redirects automatically
 */
export const useItemOwnershipValidation = (options: UseItemOwnershipValidationOptions = {}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation('other');

  const {
    redirectTo = '/unauthorized',
    showToast = true,
    toastTitle = t('ownershipValidation.accessDenied'),
    toastDescription = t('ownershipValidation.itemNotOwned')
  } = options;

  /**
   * Validates item ownership and handles unauthorized access internally
   * If unauthorized, shows toast and redirects automatically
   * @param creatorId - The ID of the user who created/owns the item
   */
  const validateOwnership = useCallback((creatorId: string): void => {
    // If no user is logged in, redirect to login
    if (!user?.id) {
      console.log('useItemOwnershipValidation: No user logged in, redirecting to login');
      navigate('/auth');
      return;
    }

    console.log('useItemOwnershipValidation: Validating ownership:', {
      creatorId,
      currentUserId: user.id,
      user: user
    });

    // Check if current user owns the item
    if (creatorId !== user.id) {
      console.log('useItemOwnershipValidation: Access denied - user does not own this item:', {
        creatorId,
        currentUserId: user.id
      });
      
      if (showToast) {
        toast({
          title: toastTitle,
          description: toastDescription,
          variant: 'destructive',
        });
      }
      
      navigate(redirectTo);
      return;
    }

    // User owns the item, do nothing
    console.log('useItemOwnershipValidation: Access granted - user owns this item');
  }, [user?.id, showToast, toastTitle, toastDescription, navigate, redirectTo]);

  return {
    validateOwnership
  };
};
