
import { supabase } from '@/integrations/supabase/client';

const NAME_EXTRACTION_SYSTEM_PROMPT = `You are a specialized AI that extracts entity names from user commands. 
Your job is to identify the specific course, lesson, or other object name that the user wants to operate on.

Examples:
- "delete RNA course" → "RNA"
- "edit Introduction to Biology course" → "Introduction to Biology"
- "remove the Python Programming class" → "Python Programming"
- "update Advanced Mathematics" → "Advanced Mathematics"

Return ONLY the entity name, nothing else. If no clear entity name is found, return "NONE".`;

// Local search function to find course by name without API call
export async function findCourseByLocalSearch(userInput: string, instructorId: string): Promise<string | null> {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('id, title')
      .eq('instructor_id', instructorId);

    if (error || !courses || courses.length === 0) {
      return null;
    }

    const normalizedInput = userInput.toLowerCase();
    
    // Try different search strategies
    for (const course of courses) {
      const normalizedTitle = course.title.toLowerCase();
      
      // 1. Exact match
      if (normalizedTitle === normalizedInput) {
        return course.id;
      }
      
      // 2. Title contains the input
      if (normalizedTitle.includes(normalizedInput)) {
        return course.id;
      }
      
      // 3. Input contains the title
      if (normalizedInput.includes(normalizedTitle)) {
        return course.id;
      }
      
      // 4. Check if any words in the title match words in the input
      const titleWords = normalizedTitle.split(' ');
      const inputWords = normalizedInput.split(' ');
      
      for (const titleWord of titleWords) {
        if (titleWord.length > 2 && inputWords.some(inputWord => 
          inputWord.includes(titleWord) || titleWord.includes(inputWord)
        )) {
          return course.id;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error in local course search:', error);
    return null;
  }
}

export async function extractEntityName(userMessage: string): Promise<string | null> {
  const apiKey = 'AIzaSyDrYPsiEl51OzqBx0qoUmiS_99F7OpMCRo';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: NAME_EXTRACTION_SYSTEM_PROMPT }]
        },
        contents: [
          {
            parts: [{ text: userMessage }]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 50,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const extractedName = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    return extractedName === 'NONE' ? null : extractedName;
  } catch (error) {
    console.error('Error extracting entity name:', error);
    return null;
  }
}

export async function findCourseByName(courseName: string, instructorId: string): Promise<string | null> {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('id, title')
      .eq('instructor_id', instructorId)
      .ilike('title', `%${courseName}%`);

    if (error) {
      console.error('Error finding course:', error);
      return null;
    }

    if (!courses || courses.length === 0) {
      return null;
    }

    // If multiple courses match, return the first one
    // In a production app, you might want to ask the user to be more specific
    return courses[0].id;
  } catch (error) {
    console.error('Error in findCourseByName:', error);
    return null;
  }
}

export async function resolveEntityId(
  userMessage: string, 
  entityType: 'course' | 'lesson', 
  instructorId: string
): Promise<string | null> {
  if (entityType === 'course') {
    console.log('Starting course resolution for:', userMessage);
    
    // Step 1: Try local search first (faster, no API call)
    const localResult = await findCourseByLocalSearch(userMessage, instructorId);
    if (localResult) {
      console.log('Found course via local search:', localResult);
      return localResult;
    }
    
    console.log('Local search failed, trying Gemini extraction...');
    
    // Step 2: If local search fails, use Gemini to extract entity name
    const entityName = await extractEntityName(userMessage);
    if (!entityName) {
      console.log('Gemini could not extract entity name');
      return null;
    }
    
    console.log('Gemini extracted entity name:', entityName);
    
    // Step 3: Search for the extracted entity name
    return await findCourseByName(entityName, instructorId);
  }
  
  if (entityType === 'lesson') {
    // TODO: Implement lesson resolution if needed
    return null;
  }
  
  return null;
}
