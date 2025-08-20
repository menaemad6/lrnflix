import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { IMAGE_UPLOAD_BUCKETS, IMAGE_UPLOAD_CONFIG, type ImageBucketType } from '@/data/constants';

export interface UploadedImage {
  url: string;
  path: string;
  size: number;
  type: string;
  name: string;
}

export interface ImageUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedImage: UploadedImage | null;
}

export interface ImageUploadOptions {
  bucket: ImageBucketType;
  folder?: string;
  fileName?: string;
  compress?: boolean;
  generateThumbnail?: boolean;
  onProgress?: (progress: number) => void;
  onSuccess?: (image: UploadedImage) => void;
  onError?: (error: string) => void;
}

export const useImageUpload = () => {
  const [state, setState] = useState<ImageUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedImage: null,
  });

  const resetState = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedImage: null,
    });
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (!IMAGE_UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type as 'image/jpeg' | 'image/jpg' | 'image/png' | 'image/webp' | 'image/gif')) {
      return `File type ${file.type} is not supported. Allowed types: ${IMAGE_UPLOAD_CONFIG.ALLOWED_TYPES.join(', ')}`;
    }

    if (file.size > IMAGE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
      const maxSizeMB = IMAGE_UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
      return `File size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds maximum allowed size of ${maxSizeMB}MB`;
    }

    return null;
  }, []);

  const compressImage = useCallback(async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        const maxDimension = IMAGE_UPLOAD_CONFIG.PREVIEW_SIZE;
        let { width, height } = img;

        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type as 'image/jpeg' | 'image/jpg' | 'image/png' | 'image/webp' | 'image/gif',
          IMAGE_UPLOAD_CONFIG.COMPRESSION_QUALITY
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const generateThumbnail = useCallback(async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const thumbnailSize = IMAGE_UPLOAD_CONFIG.THUMBNAIL_SIZE;
        let { width, height } = img;

        // Calculate dimensions for square thumbnail
        if (width > height) {
          height = (height * thumbnailSize) / width;
          width = thumbnailSize;
        } else {
          width = (width * thumbnailSize) / height;
          height = thumbnailSize;
        }

        canvas.width = thumbnailSize;
        canvas.height = thumbnailSize;

        // Center the image in the square canvas
        const offsetX = (thumbnailSize - width) / 2;
        const offsetY = (thumbnailSize - height) / 2;

        ctx?.drawImage(img, offsetX, offsetY, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          },
          'image/jpeg',
          0.8
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const generateFileName = useCallback((originalName: string, bucket: ImageBucketType): string => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${bucket}_${timestamp}_${randomId}.${extension}`;
  }, []);

  const generateUniqueFileName = useCallback((originalName: string, bucket: ImageBucketType, customFileName?: string): string => {
    if (customFileName) {
      // If custom filename is provided, make it unique
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const extension = originalName.split('.').pop();
      return `${customFileName}_${timestamp}_${randomId}.${extension}`;
    }
    return generateFileName(originalName, bucket);
  }, [generateFileName]);

  const uploadImage = useCallback(async (
    file: File,
    options: ImageUploadOptions
  ): Promise<UploadedImage> => {
    try {
      // Reset state
      setState(prev => ({ ...prev, isUploading: true, error: null, progress: 0 }));

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Generate file name
      const fileName = options.fileName ? generateUniqueFileName(file.name, options.bucket, options.fileName) : generateFileName(file.name, options.bucket);
      const folder = options.folder ? `${options.folder}/` : '';
      const filePath = `${folder}${fileName}`;

      // Compress image if requested
      let fileToUpload = file;
      if (options.compress) {
        fileToUpload = new File([await compressImage(file)], fileName, { type: file.type });
      }

      // Upload main image
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Generate thumbnail if requested
      let thumbnailPath: string | null = null;
      if (options.generateThumbnail) {
        try {
          const thumbnail = await generateThumbnail(file);
          const thumbnailFileName = `thumb_${fileName}`;
          const thumbnailFilePath = `${folder}${thumbnailFileName}`;

          const { error: thumbnailError } = await supabase.storage
            .from(options.bucket)
            .upload(thumbnailFilePath, thumbnail, {
              cacheControl: '3600',
              upsert: false,
            });

          if (!thumbnailError) {
            thumbnailPath = thumbnailFilePath;
          }
        } catch (thumbnailError) {
          console.warn('Failed to generate thumbnail:', thumbnailError);
        }
      }

      const uploadedImage: UploadedImage = {
        url: urlData.publicUrl,
        path: filePath,
        size: fileToUpload.size,
        type: fileToUpload.type,
        name: fileName,
      };

      // Update state
      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        uploadedImage,
        error: null,
      }));

      // Call success callback
      options.onSuccess?.(uploadedImage);

      return uploadedImage;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
        progress: 0,
      }));

      // Call error callback
      options.onError?.(errorMessage);
      throw error;
    }
  }, [validateFile, compressImage, generateThumbnail, generateFileName]);

  const deleteImage = useCallback(async (
    bucket: ImageBucketType,
    path: string
  ): Promise<void> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }

      // Reset state if the deleted image was the current uploaded image
      setState(prev => {
        if (prev.uploadedImage?.path === path) {
          return {
            ...prev,
            uploadedImage: null,
          };
        }
        return prev;
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      throw new Error(errorMessage);
    }
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress }));
  }, []);

  return {
    ...state,
    uploadImage,
    deleteImage,
    resetState,
    updateProgress,
  };
};
