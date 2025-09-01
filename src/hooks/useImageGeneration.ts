import { useState, useCallback } from 'react';
import { generateImages, validateImageGenerationParams, type ImageGenerationOptions } from '@/utils/geminiImageGenerator';
import { useImageUpload } from './useImageUpload';
import { IMAGE_UPLOAD_BUCKETS, type ImageBucketType } from '@/data/constants';

export interface GeneratedImage {
  url: string;
  description: string;
  metadata: {
    style: string;
    aspectRatio: string;
    quality: string;
    generatedAt: string;
    variation: number;
  };
}

export interface ImageGenerationState {
  isGenerating: boolean;
  generatedImages: GeneratedImage[];
  selectedImage: GeneratedImage | null;
  error: string | null;
  isUploading: boolean;
  uploadProgress: number;
  uploadedImageUrl: string | null;
}

export interface UseImageGenerationOptions {
  bucket: ImageBucketType;
  folder?: string;
  onImageSelected?: (image: GeneratedImage) => void;
  onImageUploaded?: (url: string) => void;
  onError?: (error: string) => void;
}

export const useImageGeneration = (options: UseImageGenerationOptions) => {
  const [state, setState] = useState<ImageGenerationState>({
    isGenerating: false,
    generatedImages: [],
    selectedImage: null,
    error: null,
    isUploading: false,
    uploadProgress: 0,
    uploadedImageUrl: null,
  });

  const { uploadImage } = useImageUpload();

  const resetState = useCallback(() => {
    setState({
      isGenerating: false,
      generatedImages: [],
      selectedImage: null,
      error: null,
      isUploading: false,
      uploadProgress: 0,
      uploadedImageUrl: null,
    });
  }, []);

  const generateImagesFromDescription = useCallback(async (
    description: string,
    generationOptions: Partial<ImageGenerationOptions> = {}
  ) => {
    // Validate input
    const validationError = validateImageGenerationParams(description);
    if (validationError) {
      setState(prev => ({ ...prev, error: validationError }));
      options.onError?.(validationError);
      return;
    }

    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null,
      generatedImages: [],
      selectedImage: null,
    }));

    try {
      const result = await generateImages(description, generationOptions);
      
      if (result.error) {
        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: result.error,
        }));
        options.onError?.(result.error);
        return;
      }

      setState(prev => ({
        ...prev,
        isGenerating: false,
        generatedImages: result.images,
        error: null,
      }));

      // Auto-select first image if available
      if (result.images.length > 0) {
        selectImage(result.images[0]);
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error.message || 'Failed to generate images',
      }));
      options.onError?.(error.message || 'Failed to generate images');
    }
  }, [options]);

  const selectImage = useCallback((image: GeneratedImage) => {
    setState(prev => ({
      ...prev,
      selectedImage: image,
      error: null,
    }));
    options.onImageSelected?.(image);
  }, [options]);

  const uploadSelectedImage = useCallback(async () => {
    if (!state.selectedImage) {
      const error = 'No image selected for upload';
      setState(prev => ({ ...prev, error }));
      options.onError?.(error);
      return;
    }

    setState(prev => ({
      ...prev,
      isUploading: true,
      error: null,
    }));

    try {
      // Convert blob URL to File object
      const response = await fetch(state.selectedImage.url);
      const blob = await response.blob();
      const file = new File([blob], `generated-image-${Date.now()}.png`, { type: 'image/png' });

      const uploadResult = await uploadImage(file, {
        bucket: options.bucket,
        folder: options.folder,
        fileName: `ai-generated-${Date.now()}.png`,
        onProgress: (progress) => {
          setState(prev => ({ ...prev, uploadProgress: progress }));
        },
      });

      if (uploadResult.error) {
        throw new Error(uploadResult.error);
      }

      setState(prev => ({
        ...prev,
        isUploading: false,
        uploadProgress: 100,
        uploadedImageUrl: uploadResult.uploadedImage?.url || null,
      }));

      options.onImageUploaded?.(uploadResult.uploadedImage?.url || '');
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: error.message || 'Failed to upload image',
      }));
      options.onError?.(error.message || 'Failed to upload image');
    }
  }, [state.selectedImage, uploadImage, options]);

  const regenerateImages = useCallback(async (
    description: string,
    generationOptions: Partial<ImageGenerationOptions> = {}
  ) => {
    // Clear previous images and regenerate
    setState(prev => ({
      ...prev,
      generatedImages: [],
      selectedImage: null,
    }));
    
    await generateImagesFromDescription(description, generationOptions);
  }, [generateImagesFromDescription]);

  const clearGeneratedImages = useCallback(() => {
    // Clean up blob URLs to prevent memory leaks
    state.generatedImages.forEach(image => {
      if (image.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url);
      }
    });

    setState(prev => ({
      ...prev,
      generatedImages: [],
      selectedImage: null,
      error: null,
    }));
  }, [state.generatedImages]);

  return {
    // State
    isGenerating: state.isGenerating,
    generatedImages: state.generatedImages,
    selectedImage: state.selectedImage,
    error: state.error,
    isUploading: state.isUploading,
    uploadProgress: state.uploadProgress,
    uploadedImageUrl: state.uploadedImageUrl,

    // Actions
    generateImages: generateImagesFromDescription,
    selectImage,
    uploadSelectedImage,
    regenerateImages,
    clearGeneratedImages,
    resetState,
  };
};
