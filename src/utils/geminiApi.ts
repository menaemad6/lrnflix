
interface QuestionData {
  question_text: string;
  options?: string[];
  question_type: 'mcq' | 'written';
}

// Helper function to build Gemini API URL
const buildGeminiApiUrl = (apiKey: string): string => {
  const baseUrl = import.meta.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=';
  return baseUrl.endsWith('?key=') ? `${baseUrl}${apiKey}` : `${baseUrl}${apiKey}`;
};

interface AnswerResponse {
  answer: string;
  explanation?: string;
}

interface BulkAnswerResponse {
  answers: {
    question_index: number;
    answer: string;
    explanation?: string;
  }[];
}

export const answerSingleQuestion = async (question: QuestionData): Promise<AnswerResponse> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set it in the settings.');
  }

  const systemPrompt = `You are an expert AI assistant that answers quiz questions accurately. 
  
For multiple choice questions:
- Analyze the question and all provided options carefully
- Return only the exact text of the correct option (not a, b, c, d - return the actual option text)
- Be precise and confident in your answer

For written questions:  
- Provide a clear, concise, and accurate answer
- Keep answers brief but complete

Always be confident and provide the most accurate answer possible.`;

  let prompt = `Question: ${question.question_text}\n\n`;
  
  if (question.question_type === 'mcq' && question.options) {
    prompt += `Options:\n`;
    question.options.forEach((option, index) => {
      if (option.trim()) {
        prompt += `${String.fromCharCode(97 + index)}) ${option}\n`;
      }
    });
    prompt += `\nProvide the exact text of the correct option.`;
  } else {
    prompt += `Provide a direct answer to this question.`;
  }

  try {
    const response = await fetch(buildGeminiApiUrl(apiKey), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 200
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!answer) {
      throw new Error('No answer received from Gemini');
    }

    return { answer };
  } catch (error: unknown) {
    throw new Error(`Failed to get answer from Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const answerAllQuestions = async (questions: QuestionData[]): Promise<BulkAnswerResponse> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set it in the settings.');
  }

  const systemPrompt = `You are an expert AI assistant that answers quiz questions accurately. You will receive multiple questions and must return answers for ALL questions in the exact JSON format specified.

CRITICAL: You must provide an answer for EVERY question provided. Do not skip any questions.

For multiple choice questions, return the exact text of the correct option (not a, b, c, d).
For written questions, provide clear and accurate answers.

Return your response as a JSON object with this exact structure:
{
  "answers": [
    {
      "question_index": 0,
      "answer": "exact answer text",
      "explanation": "optional brief explanation"
    },
    {
      "question_index": 1,
      "answer": "exact answer text",
      "explanation": "optional brief explanation"
    }
  ]
}

IMPORTANT: Include one answer object for each question, using question_index 0, 1, 2, etc.`;

  let prompt = "Please answer all of the following questions:\n\n";
  
  questions.forEach((question, index) => {
    prompt += `Question ${index}: ${question.question_text}\n`;
    
    if (question.question_type === 'mcq' && question.options) {
      prompt += `Options:\n`;
      question.options.forEach((option, optIndex) => {
        if (option.trim()) {
          prompt += `${String.fromCharCode(97 + optIndex)}) ${option}\n`;
        }
      });
    }
    prompt += '\n';
  });

  prompt += `\n\nYou must answer ALL ${questions.length} questions above. Return answers in the specified JSON format with exactly ${questions.length} answer objects. For MCQ questions, return the exact option text, not the letter. IMPORTANT: Use 0-based indexing for question_index (0, 1, 2, etc.).`;

  console.log('Sending questions to Gemini:', questions);
  console.log('Prompt being sent:', prompt);
  
  try {
    const response = await fetch(buildGeminiApiUrl(apiKey), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (response.status === 400) {
        throw new Error('Invalid request. Please check your questions and try again.');
      } else if (response.status === 401) {
        throw new Error('API key is invalid or expired. Please check your settings.');
      } else if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(`API error (${response.status}): ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('Raw Gemini response:', data);
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('No response received from Gemini');
    }

    try {
      // The response text is a JSON string, so we need to parse it
      const parsedResponse = JSON.parse(responseText);
      console.log('Parsed response:', parsedResponse);
      
      // Validate response structure
      if (!parsedResponse.answers || !Array.isArray(parsedResponse.answers)) {
        throw new Error('Invalid response format: missing or invalid answers array');
      }
      
      // Validate that we got answers for all questions
      if (parsedResponse.answers.length !== questions.length) {
        console.warn(`Expected ${questions.length} answers, but got ${parsedResponse.answers.length}`);
        // Don't throw error, just warn - we'll handle partial responses
      }
      
      // Validate each answer has required fields
      parsedResponse.answers.forEach((answer, index) => {
        if (typeof answer.question_index !== 'number' || typeof answer.answer !== 'string') {
          throw new Error(`Invalid answer format at index ${index}: missing question_index or answer`);
        }
        if (answer.question_index < 0 || answer.question_index >= questions.length) {
          throw new Error(`Invalid question_index ${answer.question_index} at answer index ${index}`);
        }
      });
      
      return parsedResponse;
    } catch (parseError) {
      console.error('Failed to parse JSON:', responseText);
      console.error('Parse error:', parseError);
      throw new Error('Failed to parse Gemini response as JSON');
    }
  } catch (error: unknown) {
    throw new Error(`Failed to get answers from Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const generateMcqOptions = async (questionText: string): Promise<{ options: string[], correct_answer: string }> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set it in the settings.');
  }

  const systemPrompt = `You are an expert AI assistant that generates multiple choice questions.
  For the given question, generate four plausible options, with one being the correct answer.
  Return the options and the correct answer in JSON format: { "options": ["option1", "option2", "option3", "option4"], "correct_answer": "correct_option" }`;

  const prompt = `Question: ${questionText}`;

  try {
    const response = await fetch(buildGeminiApiUrl(apiKey), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.candidates[0].finishReason === 'MAX_TOKENS') {
        throw new Error('The response was truncated due to token limits. Please try a shorter question.');
    }
    
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No response received from Gemini');
    }

    try {
      const parsedResponse = JSON.parse(responseText);
      return parsedResponse;
    } catch (parseError) {
      throw new Error('Failed to parse Gemini response as JSON');
    }
  } catch (error: unknown) {
    throw new Error(`Failed to generate options from Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

interface GenerateQuestionsParams {
  quizDescription: string;
  numberOfQuestions: number;
  questionType: 'both' | 'mcq' | 'written';
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
}

interface GeneratedQuestion {
  question_text: string;
  question_type: 'mcq' | 'written';
  options?: string[];
  correct_answer?: string;
  points: number;
}

export const generateQuestions = async (params: GenerateQuestionsParams): Promise<GeneratedQuestion[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set it in the settings.');
  }

  const { quizDescription, numberOfQuestions, questionType, difficulty } = params;

  const systemPrompt = `You are an expert AI assistant that generates educational quiz questions. 
  
  Generate high-quality questions based on the provided quiz description. Each question should be:
  - Clear and well-structured
  - Appropriate for the specified difficulty level
  - Educationally valuable and relevant to the topic
  - Free from bias and inclusive

  For multiple choice questions:
  - Provide exactly 4 options (A, B, C, D)
  - Make sure only one option is clearly correct
  - Make incorrect options plausible but clearly wrong
  - Avoid obvious patterns in correct answers

  For written questions:
  - Ask for explanations, analysis, or detailed answers
  - Provide clear evaluation criteria in the question

  Return your response as a JSON array with this exact structure:
  [
    {
      "question_text": "The question text here",
      "question_type": "mcq" or "written",
      "options": ["option1", "option2", "option3", "option4"] (only for MCQ),
      "correct_answer": "correct option text" (only for MCQ),
      "points": 1
    }
  ]`;

  let prompt = `Quiz Topic: ${quizDescription}\n\n`;
  prompt += `Generate ${numberOfQuestions} questions with the following specifications:\n`;
  prompt += `- Difficulty Level: ${difficulty}\n`;
  prompt += `- Question Type: ${questionType}\n\n`;
  
  if (questionType === 'both') {
    prompt += `Mix of multiple choice and written questions. For written questions, don't include options or correct_answer fields.\n`;
  } else if (questionType === 'mcq') {
    prompt += `All questions should be multiple choice with 4 options each.\n`;
  } else {
    prompt += `All questions should be written/essay type questions. Don't include options or correct_answer fields.\n`;
  }

  prompt += `\nMake sure each question is worth 1 point and is appropriate for the difficulty level specified.`;

  try {
    const response = await fetch(buildGeminiApiUrl(apiKey), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No response received from Gemini');
    }

    try {
      const parsedResponse = JSON.parse(responseText);
      
      // Validate the response structure
      if (!Array.isArray(parsedResponse)) {
        throw new Error('Response is not an array');
      }

      // Ensure all questions have required fields
      const validatedQuestions = parsedResponse.map((q: Record<string, unknown>, index: number) => ({
        question_text: (q.question_text as string) || `Generated Question ${index + 1}`,
        question_type: (q.question_type as 'mcq' | 'written') || 'mcq',
        options: q.question_type === 'mcq' ? (q.options as string[] || []) : undefined,
        correct_answer: q.question_type === 'mcq' ? (q.correct_answer as string || '') : undefined,
        points: (q.points as number) || 1
      }));

      return validatedQuestions;
    } catch (parseError) {
      throw new Error('Failed to parse Gemini response as JSON');
    }
  } catch (error: unknown) {
    throw new Error(`Failed to generate questions from Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};