interface ImageGenerationOptions {
  description: string;
  style?: 'realistic' | 'artistic' | 'cartoon' | 'abstract' | 'minimalist';
  aspectRatio?: '1:1' | '16:9' | '4:3' | '3:2';
  quality?: 'low' | 'medium' | 'high';
}

interface GeneratedImage {
  url: string;
  description: string;
  metadata: {
    style: string;
    aspectRatio: string;
    quality: string;
    generatedAt: string;
  };
}

interface ImageGenerationResponse {
  images: GeneratedImage[];
  error?: string;
}

export const generateImages = async (
  description: string,
  options: Partial<ImageGenerationOptions> = {}
): Promise<ImageGenerationResponse> => {
  const apiKey = import.meta.env.VITE_GEMINI_IMAGES_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set it in the settings.');
  }

  const {
    style = 'realistic',
    aspectRatio = '1:1',
    quality = 'medium'
  } = options;

  // Enhanced prompt engineering for better image generation
  const enhancedDescription = enhanceImageDescription(description, style);
  
  // Create a comprehensive prompt for image generation
  const finalPrompt = `Generate 2 high-quality images based on this description: ${enhancedDescription}. 
  Style: ${style}
  Aspect ratio: ${aspectRatio}
  Quality: ${quality}
  
  The images should be:
  - Visually appealing and suitable for educational content
  - Clear, well-composed, and match the description accurately
  - Professional and engaging for course thumbnails
  - Different variations to give users choice
  
  Please generate exactly 2 images with these specifications.`;

  try {
    // Use the correct Gemini model for image generation
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: finalPrompt }]
        }],
        generationConfig: { 
          responseModalities: ["Text", "Image"],
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Gemini Response:", data); // Debugging

    // Extract Base64 images from the response
    const images = data?.candidates?.[0]?.content?.parts
      ?.filter(part => part.inlineData?.mimeType === "image/png")
      ?.map(part => part.inlineData?.data) || [];

    if (images.length === 0) {
      throw new Error('No images generated from Gemini API');
    }

    // Convert base64 images to blob URLs for preview
    const processedImages = images.map((imageData, index) => {
      try {
        // Ensure Base64 is correctly padded
        let base64Data = imageData.replace(/_/g, "/").replace(/-/g, "+");
        while (base64Data.length % 4 !== 0) {
          base64Data += "=";
        }

        // Decode Base64
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length)
          .fill(0)
          .map((_, index) => byteCharacters.charCodeAt(index));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        const url = URL.createObjectURL(blob);

        return {
          url,
          description: `${enhancedDescription} - Variation ${index + 1}`,
          metadata: {
            style,
            aspectRatio,
            quality,
            generatedAt: new Date().toISOString(),
            variation: index + 1
          }
        };
      } catch (decodeError) {
        console.error("Error decoding Base64 image at index", index, decodeError);
        throw new Error(`Failed to process generated image ${index + 1}`);
      }
    });

    return { images: processedImages };
  } catch (error: any) {
    console.error("Error generating images:", error);
    return {
      images: [],
      error: `Failed to generate images: ${error.message}`
    };
  }
};

// Helper function to enhance image descriptions for better generation
const enhanceImageDescription = (description: string, style: string): string => {
  let enhanced = description.trim();
  
  // Add style-specific enhancements
  switch (style) {
    case 'realistic':
      enhanced += ', photorealistic, detailed, professional photography';
      break;
    case 'artistic':
      enhanced += ', artistic interpretation, creative, visually striking';
      break;
    case 'cartoon':
      enhanced += ', cartoon style, colorful, friendly, animated';
      break;
    case 'abstract':
      enhanced += ', abstract representation, modern, conceptual';
      break;
    case 'minimalist':
      enhanced += ', minimalist design, clean, simple, elegant';
      break;
  }

  // Add educational context if not already present
  if (!enhanced.toLowerCase().includes('educational') && !enhanced.toLowerCase().includes('learning')) {
    enhanced += ', suitable for educational content, clear and informative';
  }

  return enhanced;
};

// Utility function to validate image generation parameters
export const validateImageGenerationParams = (description: string): string | null => {
  if (!description || description.trim().length === 0) {
    return 'Image description is required';
  }
  
  if (description.trim().length < 10) {
    return 'Image description should be at least 10 characters long';
  }
  
  if (description.trim().length > 500) {
    return 'Image description should not exceed 500 characters';
  }
  
  return null;
};

// Utility function to get available styles
export const getAvailableStyles = () => [
  { value: 'realistic', label: 'Realistic', description: 'Photorealistic images' },
  { value: 'artistic', label: 'Artistic', description: 'Creative and expressive' },
  { value: 'cartoon', label: 'Cartoon', description: 'Fun and colorful' },
  { value: 'abstract', label: 'Abstract', description: 'Conceptual and modern' },
  { value: 'minimalist', label: 'Minimalist', description: 'Clean and simple' }
];

// Utility function to get available aspect ratios
export const getAvailableAspectRatios = () => [
  { value: '1:1', label: 'Square (1:1)', description: 'Perfect for thumbnails' },
  { value: '16:9', label: 'Widescreen (16:9)', description: 'Good for presentations' },
  { value: '4:3', label: 'Standard (4:3)', description: 'Traditional format' },
  { value: '3:2', label: 'Photo (3:2)', description: 'Classic photography ratio' }
];
