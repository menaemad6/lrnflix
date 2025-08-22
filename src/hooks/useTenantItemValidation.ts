import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export interface TenantItem {
  instructor_id?: string;
  creator_id?: string;
  user_id?: string;
  teacher_id?: string;
  [key: string]: unknown; // Allow for other fields
}

export interface UseTenantItemValidationOptions {
  redirectTo?: string;
  showToast?: boolean;
  toastTitle?: string;
  toastDescription?: string;
}

/**
 * Reusable hook for tenant item validation
 * Checks if an item is valid for the current tenant
 * If valid, does nothing; otherwise, shows toast and redirects
 */
export const useTenantItemValidation = (options: UseTenantItemValidationOptions = {}) => {
  const { teacher } = useTenant();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation('other');

  const {
    redirectTo = '/',
    showToast = true,
    toastTitle = t('tenantValidation.contentUnavailable'),
    toastDescription = t('tenantValidation.notAvailableInYourPlatform')
  } = options;

  /**
   * Validates an item and handles invalid cases internally
   * If invalid, shows toast and redirects automatically
   * @param item - The item to validate
   */
  const validateAndHandle = useCallback((item: TenantItem): void => {
    // If no tenant context, allow access (platform mode)
    if (!teacher?.user_id) {
      console.log('useTenantItemValidation: No tenant context, allowing access (platform mode)');
      return;
    }

    // Check various possible creator fields
    const creatorId = item.instructor_id || item.creator_id || item.user_id || item.teacher_id;
    
    console.log('useTenantItemValidation: Validating item:', {
      itemId: item.id,
      creatorId,
      teacherUserId: teacher.user_id,
      item: item
    });
    
    // If no creator ID found, deny access (safety first)
    if (!creatorId) {
      console.log('useTenantItemValidation: No creator ID found, denying access');
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

    // Check if creator matches current tenant
    // Note: teacher.user_id is the profile ID, and item.instructor_id is also a profile ID
    // So they should match if the item belongs to the current tenant
    if (creatorId !== teacher.user_id) {
      console.log('useTenantItemValidation: Creator ID mismatch, denying access:', {
        creatorId,
        teacherUserId: teacher.user_id
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

    // Item is valid, do nothing
    console.log('useTenantItemValidation: Item is valid for current tenant');
  }, [teacher?.user_id, showToast, toastTitle, toastDescription, navigate, redirectTo]);

  /**
   * Manually validate with a specific creator ID
   * Useful when the item structure doesn't match expected patterns
   * @param creatorId - The creator ID to validate against
   */
  const validateWithCreatorId = useCallback((creatorId: string): void => {
    // If no tenant context, allow access (platform mode)
    if (!teacher?.user_id) {
      console.log('useTenantItemValidation: No tenant context, allowing access (platform mode)');
      return;
    }

    console.log('useTenantItemValidation: Manually validating with creator ID:', {
      creatorId,
      teacherUserId: teacher.user_id
    });

    // Check if creator matches current tenant
    if (creatorId !== teacher.user_id) {
      console.log('useTenantItemValidation: Creator ID mismatch, denying access:', {
        creatorId,
        teacherUserId: teacher.user_id
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

    // Item is valid, do nothing
    console.log('useTenantItemValidation: Creator ID is valid for current tenant');
  }, [teacher?.user_id, showToast, toastTitle, toastDescription, navigate, redirectTo]);

  return {
    validateAndHandle,
    validateWithCreatorId
  };
};
