# Image Uploader System

A comprehensive, reusable image upload system for the Learnify platform with drag-and-drop functionality, image compression, thumbnail generation, and Supabase storage integration.

## Features

- 🖼️ **Drag & Drop Upload**: Intuitive file upload with visual feedback
- 📁 **Multiple Bucket Support**: Organized storage across different content types
- 🗜️ **Image Compression**: Automatic image optimization for better performance
- 🖼️ **Thumbnail Generation**: Automatic thumbnail creation for previews
- ✅ **File Validation**: Type and size validation with helpful error messages
- 📊 **Progress Tracking**: Real-time upload progress indication
- 🎨 **Customizable UI**: Multiple variants and sizes for different use cases
- 🔄 **Error Handling**: Comprehensive error handling with user feedback
- 🗑️ **Delete Functionality**: Remove uploaded images with confirmation

## Bucket Configuration

The system supports the following Supabase storage buckets:

```typescript
export const IMAGE_UPLOAD_BUCKETS = {
  LECTURES_THUMBNAILS: 'lectures_thumbnails',    // Course thumbnails
  CHAPTERS_THUMBNAILS: 'chapters_thumbnails',    // Chapter thumbnails
  GROUPS_THUMBNAILS: 'groups_thumbnails',        // Group thumbnails
  QUIZ_QUESTIONS: 'quiz_questions',              // Quiz question images
  TEACHERS_IMAGES: 'teachers_images',            // Teacher profile images
}
```

## Configuration

```typescript
export const IMAGE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,        // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  COMPRESSION_QUALITY: 0.8,               // 80% quality
  THUMBNAIL_SIZE: 300,                    // 300x300px thumbnails
  PREVIEW_SIZE: 800,                      // Max dimension for compressed images
}
```

## Usage

### Basic Image Uploader

```tsx
import { ImageUploader } from '@/components/ui/ImageUploader';
import { IMAGE_UPLOAD_BUCKETS } from '@/data/constants';

<ImageUploader
  bucket={IMAGE_UPLOAD_BUCKETS.LECTURES_THUMBNAILS}
  folder="courses"
  onImageUploaded={(image) => console.log('Uploaded:', image)}
  onImageDeleted={(path) => console.log('Deleted:', path)}
  onError={(error) => console.error('Error:', error)}
/>
```

### Advanced Configuration

```tsx
<ImageUploader
  bucket={IMAGE_UPLOAD_BUCKETS.CHAPTERS_THUMBNAILS}
  folder="chapters"
  fileName="custom-name"
  compress={true}
  generateThumbnail={true}
  maxFiles={3}
  variant="compact"
  size="lg"
  disabled={false}
  showPreview={true}
  accept={['image/jpeg', 'image/png']}
  placeholder="Drop your images here"
  className="custom-styles"
  onImageUploaded={handleImageUploaded}
  onImageDeleted={handleImageDeleted}
  onError={handleError}
/>
```

## Hook Usage

### useImageUpload Hook

```tsx
import { useImageUpload } from '@/hooks/useImageUpload';

const {
  isUploading,
  progress,
  error,
  uploadedImage,
  uploadImage,
  deleteImage,
  resetState,
  updateProgress
} = useImageUpload();

// Upload an image
const handleUpload = async (file: File) => {
  try {
    const image = await uploadImage(file, {
      bucket: IMAGE_UPLOAD_BUCKETS.LECTURES_THUMBNAILS,
      folder: 'courses',
      compress: true,
      generateThumbnail: true,
      onSuccess: (image) => console.log('Success:', image),
      onError: (error) => console.error('Error:', error),
      onProgress: (progress) => console.log('Progress:', progress)
    });
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Delete an image
await deleteImage(bucket, path);
```

## Component Props

### ImageUploader Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `bucket` | `ImageBucketType` | - | **Required** - Supabase storage bucket |
| `folder` | `string` | - | Optional folder within bucket |
| `fileName` | `string` | - | Custom filename (auto-generated if not provided) |
| `compress` | `boolean` | `true` | Enable image compression |
| `generateThumbnail` | `boolean` | `false` | Generate thumbnail version |
| `maxFiles` | `number` | `1` | Maximum number of files to upload |
| `variant` | `'default' \| 'compact' \| 'minimal'` | `'default'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size |
| `disabled` | `boolean` | `false` | Disable upload functionality |
| `showPreview` | `boolean` | `true` | Show uploaded image preview |
| `accept` | `string[]` | `IMAGE_UPLOAD_CONFIG.ALLOWED_TYPES` | Allowed file types |
| `placeholder` | `string` | Default text | Custom placeholder text |
| `className` | `string` | - | Additional CSS classes |
| `onImageUploaded` | `(image: UploadedImage) => void` | - | Upload success callback |
| `onImageDeleted` | `(path: string) => void` | - | Delete success callback |
| `onError` | `(error: string) => void` | - | Error callback |

## Integration Examples

### Course Creation Modal

```tsx
// In CreateCourseModal.tsx
const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);

const handleImageUploaded = (image: UploadedImage) => {
  setUploadedImage(image);
  toast({
    title: "Success",
    description: "Course thumbnail uploaded successfully!",
  });
};

// In the form
<ImageUploader
  bucket={IMAGE_UPLOAD_BUCKETS.LECTURES_THUMBNAILS}
  folder="courses"
  compress={true}
  generateThumbnail={true}
  onImageUploaded={handleImageUploaded}
  variant="compact"
  size="sm"
  placeholder="Upload course thumbnail"
/>

// In the submit handler
const { error } = await supabase
  .from('courses')
  .insert([{
    title: formData.title,
    description: formData.description,
    price: formData.price,
    instructor_id: user.id,
    status: 'draft',
    cover_image_url: uploadedImage?.url || null
  }]);
```

### Chapter Creation Modal

```tsx
// Similar pattern for chapters
<ImageUploader
  bucket={IMAGE_UPLOAD_BUCKETS.CHAPTERS_THUMBNAILS}
  folder="chapters"
  compress={true}
  generateThumbnail={true}
  onImageUploaded={handleImageUploaded}
  variant="compact"
  size="sm"
  placeholder="Upload chapter thumbnail"
/>
```

### Group Creation

```tsx
// For groups (requires thumbnail_url field in database)
<ImageUploader
  bucket={IMAGE_UPLOAD_BUCKETS.GROUPS_THUMBNAILS}
  folder="groups"
  compress={true}
  generateThumbnail={true}
  onImageUploaded={handleImageUploaded}
  variant="compact"
  size="sm"
  placeholder="Upload group thumbnail"
/>
```

## Database Schema Updates

### Groups Table Migration

```sql
-- Add thumbnail field to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN groups.thumbnail_url IS 'URL to the group thumbnail image stored in Supabase storage';
```

### Existing Tables

The following tables already support image uploads:

- **courses**: `cover_image_url` field
- **chapters**: `cover_image_url` field
- **groups**: `thumbnail_url` field (after migration)

## File Structure

```
src/
├── components/
│   └── ui/
│       └── ImageUploader.tsx          # Main component
├── hooks/
│   └── useImageUpload.ts              # Upload logic hook
├── data/
│   └── constants.ts                   # Bucket and config constants
└── components/
    └── ImageUploaderDemo.tsx          # Demo component
```

## Error Handling

The system provides comprehensive error handling:

- **File Type Validation**: Ensures only supported image types are uploaded
- **File Size Validation**: Prevents oversized files from being uploaded
- **Upload Errors**: Handles network and storage errors gracefully
- **User Feedback**: Toast notifications for success, error, and progress states

## Performance Features

- **Image Compression**: Reduces file sizes while maintaining quality
- **Thumbnail Generation**: Creates optimized preview images
- **Lazy Loading**: Images are only processed when needed
- **Progress Tracking**: Real-time feedback during uploads

## Security Considerations

- **File Type Validation**: Only allows safe image formats
- **Size Limits**: Prevents abuse through large file uploads
- **Bucket Isolation**: Different content types use separate storage buckets
- **User Authentication**: Integrates with existing auth system

## Browser Support

- **Modern Browsers**: Full support for drag & drop and File API
- **Fallbacks**: Graceful degradation for older browsers
- **Mobile Support**: Touch-friendly interface for mobile devices

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check Supabase bucket permissions and RLS policies
2. **Image Not Displaying**: Verify the image URL is accessible and public
3. **Compression Errors**: Ensure the image format is supported
4. **Thumbnail Generation Fails**: Check if the image can be loaded into canvas

### Debug Mode

Enable console logging to debug upload issues:

```tsx
<ImageUploader
  // ... other props
  onError={(error) => {
    console.error('Upload error:', error);
    // Handle error in UI
  }}
/>
```

## Contributing

When adding new features to the image uploader:

1. Update the constants file with new bucket configurations
2. Add new variants or sizes as needed
3. Test with different file types and sizes
4. Update this documentation
5. Ensure backward compatibility

## License

This image uploader system is part of the Learnify platform and follows the same licensing terms.
