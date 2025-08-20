import React, { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useImageUpload, type ImageUploadOptions, type UploadedImage } from '@/hooks/useImageUpload';
import { IMAGE_UPLOAD_CONFIG } from '@/data/constants';

export interface ImageUploaderProps {
  bucket: ImageUploadOptions['bucket'];
  folder?: string;
  fileName?: string;
  compress?: boolean;
  generateThumbnail?: boolean;
  onImageUploaded?: (image: UploadedImage) => void;
  onImageDeleted?: (path: string) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  maxFiles?: number;
  accept?: string[];
  placeholder?: string;
  variant?: 'default' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  bucket,
  folder,
  fileName,
  compress = true,
  generateThumbnail = false,
  onImageUploaded,
  onImageDeleted,
  onError,
  className,
  disabled = false,
  showPreview = true,
  maxFiles = 1,
  accept = IMAGE_UPLOAD_CONFIG.ALLOWED_TYPES,
  placeholder = 'Drag & drop images here, or click to select',
  variant = 'default',
  size = 'md',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const {
    isUploading,
    progress,
    error,
    uploadedImage,
    uploadImage,
    deleteImage,
    resetState,
  } = useImageUpload();

  const handleUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    try {
      // Create preview URLs for immediate display
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);

      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const options: ImageUploadOptions = {
          bucket,
          folder,
          fileName: fileName ? `${fileName}_${i + 1}` : undefined,
          compress,
          generateThumbnail,
          onSuccess: (image) => {
            onImageUploaded?.(image);
            // Clean up preview URL
            setPreviewUrls(prev => prev.filter((_, index) => index !== i));
          },
          onError: (error) => {
            onError?.(error);
            // Clean up preview URL on error
            setPreviewUrls(prev => prev.filter((_, index) => index !== i));
          },
        };

        await uploadImage(file, options);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [bucket, folder, fileName, compress, generateThumbnail, uploadImage, onImageUploaded, onError]);

  const handleDelete = useCallback(async () => {
    if (!uploadedImage) return;

    try {
      await deleteImage(bucket, uploadedImage.path);
      onImageDeleted?.(uploadedImage.path);
      resetState();
      setPreviewUrls([]);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }, [uploadedImage, bucket, deleteImage, onImageDeleted, resetState]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (disabled || acceptedFiles.length === 0) return;
    
    const filesToUpload = acceptedFiles.slice(0, maxFiles);
    handleUpload(filesToUpload);
  }, [disabled, maxFiles, handleUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    disabled: disabled || isUploading,
    multiple: maxFiles > 1,
  });

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      handleUpload(files);
    }
  }, [handleUpload]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'min-h-[120px] p-3';
      case 'lg':
        return 'min-h-[200px] p-6';
      default:
        return 'min-h-[160px] p-4';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'border-2 border-dashed';
      case 'minimal':
        return 'border border-dashed';
      default:
        return 'border-2 border-dashed';
    }
  };

  const renderContent = () => {
    if (isUploading) {
      return (
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-sm text-muted-foreground">Uploading...</div>
          <Progress value={progress} className="w-full max-w-xs" />
        </div>
      );
    }

    if (uploadedImage && showPreview) {
      return (
        <div className="flex flex-col items-center space-y-3">
          <div className="relative group">
            <img
              src={uploadedImage.url}
              alt="Uploaded"
              className="max-w-full max-h-32 object-cover rounded-lg"
            />
            <Button
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleDelete}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground text-center">
            {uploadedImage.name}
          </div>
        </div>
      );
    }

    if (previewUrls.length > 0) {
      return (
        <div className="flex flex-wrap gap-2 justify-center">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="h-16 w-16 object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center space-y-3 text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
          {isDragActive ? (
            <Upload className="h-6 w-6 text-primary" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {isDragActive ? 'Drop images here' : 'Upload images'}
          </p>
          <p className="text-xs text-muted-foreground">{placeholder}</p>
        </div>
        <div className="text-xs text-muted-foreground">
          {accept.join(', ')} • Max {IMAGE_UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB
        </div>
      </div>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative cursor-pointer transition-all duration-200 ease-in-out',
          getSizeClasses(),
          getVariantClasses(),
          'bg-background hover:bg-muted/50',
          isDragActive && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed',
          isUploading && 'cursor-wait'
        )}
        onClick={handleClick}
      >
        <input
          {...getInputProps()}
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={accept.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
        {renderContent()}
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {uploadedImage && (
        <div className="flex items-center space-x-2 text-sm text-success">
          <CheckCircle className="h-4 w-4" />
          <span>Image uploaded successfully!</span>
        </div>
      )}
    </div>
  );
};
