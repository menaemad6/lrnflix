
interface QuestionData {
  question_text: string;
  options?: string[];
  question_type: 'mcq' | 'written';
}

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
  const apiKey = localStorage.getItem('GEMINI_API_KEY');
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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
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
  } catch (error: any) {
    throw new Error(`Failed to get answer from Gemini: ${error.message}`);
  }
};

export const answerAllQuestions = async (questions: QuestionData[]): Promise<BulkAnswerResponse> => {
  const apiKey = localStorage.getItem('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set it in the settings.');
  }

  const systemPrompt = `You are an expert AI assistant that answers quiz questions accurately. You will receive multiple questions and must return answers in the exact JSON format specified.

For multiple choice questions, return the exact text of the correct option (not a, b, c, d).
For written questions, provide clear and accurate answers.

Return your response as a JSON object with this exact structure:
{
  "answers": [
    {
      "question_index": 0,
      "answer": "exact answer text",
      "explanation": "optional brief explanation"
    }
  ]
}`;

  let prompt = "Please answer all of the following questions:\n\n";
  
  questions.forEach((question, index) => {
    prompt += `Question ${index + 1}: ${question.question_text}\n`;
    
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

  prompt += `\nReturn answers in the specified JSON format. For MCQ questions, return the exact option text, not the letter.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
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
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
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
  } catch (error: any) {
    throw new Error(`Failed to get answers from Gemini: ${error.message}`);
  }
};
