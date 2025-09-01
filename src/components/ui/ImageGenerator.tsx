import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useImageGeneration } from '@/hooks/useImageGeneration';
import { getAvailableStyles, getAvailableAspectRatios } from '@/utils/geminiImageGenerator';
import { IMAGE_UPLOAD_BUCKETS, type ImageBucketType } from '@/data/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wand2, 
  Upload, 
  RefreshCw, 
  Check, 
  Image as ImageIcon, 
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface ImageGeneratorProps {
  bucket: ImageBucketType;
  folder?: string;
  title?: string;
  description?: string;
  placeholder?: string;
  onImageUploaded?: (url: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  bucket,
  folder,
  title = 'AI Image Generator',
  description = 'Generate custom images using AI based on your description',
  placeholder = 'Describe the image you want to generate...',
  onImageUploaded,
  onError,
  className = '',
}) => {
  const { t } = useTranslation();
  const [imageDescription, setImageDescription] = useState('');
  const [style, setStyle] = useState('realistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');

  const {
    isGenerating,
    generatedImages,
    selectedImage,
    error,
    isUploading,
    uploadProgress,
    uploadedImageUrl,
    generateImages,
    selectImage,
    uploadSelectedImage,
    regenerateImages,
    clearGeneratedImages,
    resetState,
  } = useImageGeneration({
    bucket,
    folder,
    onImageUploaded,
    onError,
  });

  const handleGenerate = async () => {
    if (!imageDescription.trim()) {
      onError?.('Please enter a description for the image');
      return;
    }

    await generateImages(imageDescription, {
      style: style as 'realistic' | 'artistic' | 'cartoon' | 'abstract' | 'minimalist',
      aspectRatio: aspectRatio as '1:1' | '16:9' | '4:3' | '3:2',
    });
  };

  const handleRegenerate = async () => {
    await regenerateImages(imageDescription, {
      style: style as 'realistic' | 'artistic' | 'cartoon' | 'abstract' | 'minimalist',
      aspectRatio: aspectRatio as '1:1' | '16:9' | '4:3' | '3:2',
    });
  };

  const handleUpload = async () => {
    await uploadSelectedImage();
  };

  const handleClear = () => {
    clearGeneratedImages();
    setImageDescription('');
    resetState();
  };

  const styles = getAvailableStyles();
  const aspectRatios = getAvailableAspectRatios();

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-description">Image Description</Label>
            <Textarea
              id="image-description"
              placeholder={placeholder}
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
              className="min-h-[80px]"
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style-select">Style</Label>
              <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((styleOption) => (
                    <SelectItem key={styleOption.value} value={styleOption.value}>
                      <div className="flex flex-col">
                        <span>{styleOption.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {styleOption.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aspect-ratio-select">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aspectRatios.map((ratio) => (
                    <SelectItem key={ratio.value} value={ratio.value}>
                      <div className="flex flex-col">
                        <span>{ratio.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {ratio.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !imageDescription.trim()}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Images
                </>
              )}
            </Button>
            
            {generatedImages.length > 0 && (
              <Button
                onClick={handleRegenerate}
                disabled={isGenerating}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Generated Images */}
        {generatedImages.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Images</h3>
              <Badge variant="secondary">
                {generatedImages.length} variations
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedImages.map((image, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedImage === image
                      ? 'ring-2 ring-primary border-primary'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => selectImage(image)}
                >
                  <CardContent className="p-4">
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                      <img
                        src={image.url}
                        alt={`Generated image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {selectedImage === image && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check className="h-8 w-8 text-primary bg-background rounded-full p-1" />
                        </div>
                      )}
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Variation {index + 1}</span>
                        <Badge variant="outline" className="text-xs">
                          {image.metadata.style}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {image.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Upload Section */}
            {selectedImage && (
              <div className="space-y-4">
                <Separator />
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Selected Image</h3>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload to Storage
                      </>
                    )}
                  </Button>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Upload Progress</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}

                {uploadedImageUrl && (
                  <Alert>
                    <ImageIcon className="h-4 w-4" />
                    <AlertDescription>
                      Image uploaded successfully! URL: {uploadedImageUrl}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Clear Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
