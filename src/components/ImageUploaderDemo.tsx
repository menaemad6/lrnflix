import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { IMAGE_UPLOAD_BUCKETS } from '@/data/constants';
import type { UploadedImage } from '@/hooks/useImageUpload';

export const ImageUploaderDemo = () => {
  const handleImageUploaded = (image: UploadedImage, bucketName: string) => {
    console.log(`${bucketName} image uploaded:`, image);
  };

  const handleImageDeleted = (path: string, bucketName: string) => {
    console.log(`${bucketName} image deleted:`, path);
  };

  const handleError = (error: string, bucketName: string) => {
    console.error(`${bucketName} upload error:`, error);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Image Uploader Demo</h1>
        <p className="text-muted-foreground">
          This page demonstrates the reusable ImageUploader component with different configurations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course Thumbnail Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Course Thumbnail</CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload course thumbnails to lectures_thumbnails bucket
            </p>
          </CardHeader>
          <CardContent>
            <ImageUploader
              bucket={IMAGE_UPLOAD_BUCKETS.LECTURES_THUMBNAILS}
              folder="demo/courses"
              compress={true}
              generateThumbnail={true}
              onImageUploaded={(image) => handleImageUploaded(image, 'Course')}
              onImageDeleted={(path) => handleImageDeleted(path, 'Course')}
              onError={(error) => handleError(error, 'Course')}
              variant="default"
              size="md"
              placeholder="Upload course thumbnail"
            />
          </CardContent>
        </Card>

        {/* Chapter Thumbnail Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Chapter Thumbnail</CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload chapter thumbnails to chapters_thumbnails bucket
            </p>
          </CardHeader>
          <CardContent>
            <ImageUploader
              bucket={IMAGE_UPLOAD_BUCKETS.CHAPTERS_THUMBNAILS}
              folder="demo/chapters"
              compress={true}
              generateThumbnail={true}
              onImageUploaded={(image) => handleImageUploaded(image, 'Chapter')}
              onImageDeleted={(path) => handleImageDeleted(path, 'Chapter')}
              onError={(error) => handleError(error, 'Chapter')}
              variant="default"
              size="md"
              placeholder="Upload chapter thumbnail"
            />
          </CardContent>
        </Card>

        {/* Group Thumbnail Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Group Thumbnail</CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload group thumbnails to groups_thumbnails bucket
            </p>
          </CardHeader>
          <CardContent>
            <ImageUploader
              bucket={IMAGE_UPLOAD_BUCKETS.GROUPS_THUMBNAILS}
              folder="demo/groups"
              compress={true}
              generateThumbnail={true}
              onImageUploaded={(image) => handleImageUploaded(image, 'Group')}
              onImageDeleted={(path) => handleImageDeleted(path, 'Group')}
              onError={(error) => handleError(error, 'Group')}
              variant="default"
              size="md"
              placeholder="Upload group thumbnail"
            />
          </CardContent>
        </Card>

        {/* Quiz Question Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Question Image</CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload quiz question images to quiz_questions bucket
            </p>
          </CardHeader>
          <CardContent>
            <ImageUploader
              bucket={IMAGE_UPLOAD_BUCKETS.QUIZ_QUESTIONS}
              folder="demo/quiz"
              compress={false}
              generateThumbnail={false}
              onImageUploaded={(image) => handleImageUploaded(image, 'Quiz')}
              onImageDeleted={(path) => handleImageDeleted(path, 'Quiz')}
              onError={(error) => handleError(error, 'Quiz')}
              variant="default"
              size="md"
              placeholder="Upload quiz question image"
            />
          </CardContent>
        </Card>

        {/* Teacher Profile Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Teacher Profile Image</CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload teacher profile images to teachers_images bucket
            </p>
          </CardHeader>
          <CardContent>
            <ImageUploader
              bucket={IMAGE_UPLOAD_BUCKETS.TEACHERS_IMAGES}
              folder="demo/teachers"
              compress={true}
              generateThumbnail={true}
              onImageUploaded={(image) => handleImageUploaded(image, 'Teacher')}
              onImageDeleted={(path) => handleImageDeleted(path, 'Teacher')}
              onError={(error) => handleError(error, 'Teacher')}
              variant="default"
              size="md"
              placeholder="Upload teacher profile image"
            />
          </CardContent>
        </Card>

        {/* Multiple Files Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Multiple Files Upload</CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload multiple images at once (max 5 files)
            </p>
          </CardHeader>
          <CardContent>
            <ImageUploader
              bucket={IMAGE_UPLOAD_BUCKETS.LECTURES_THUMBNAILS}
              folder="demo/multiple"
              compress={true}
              generateThumbnail={true}
              maxFiles={5}
              onImageUploaded={(image) => handleImageUploaded(image, 'Multiple')}
              onImageDeleted={(path) => handleImageDeleted(path, 'Multiple')}
              onError={(error) => handleError(error, 'Multiple')}
              variant="default"
              size="lg"
              placeholder="Upload multiple images"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Core Features</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Drag & drop file upload</li>
                <li>• File validation (type, size)</li>
                <li>• Image compression</li>
                <li>• Thumbnail generation</li>
                <li>• Progress tracking</li>
                <li>• Error handling</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Customization</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Multiple size variants</li>
                <li>• Different visual styles</li>
                <li>• Folder organization</li>
                <li>• Callback functions</li>
                <li>• Multiple file support</li>
                <li>• Responsive design</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
