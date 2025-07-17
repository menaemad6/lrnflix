
export const generateQuestionTitle = async (content: string): Promise<string> => {
  const apiKey = localStorage.getItem('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set it in the settings.');
  }

  const systemPrompt = `You are an expert at creating concise, professional question titles. 

Given a question content, generate a clear, specific, and engaging title that:
- Is maximum 10-12 words
- Captures the essence of the question
- Uses professional language
- Is easy to understand
- Helps others quickly identify what the question is about

Return ONLY the title, nothing else.`;

  const prompt = `Question content: "${content}"

Generate a professional title for this question.`;

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
          temperature: 0.3,
          maxOutputTokens: 50
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const title = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!title) {
      throw new Error('No title generated from Gemini');
    }

    return title;
  } catch (error: any) {
    console.error('Error generating title:', error);
    // Fallback to first few words of content
    const fallbackTitle = content.split(' ').slice(0, 8).join(' ');
    return fallbackTitle.length > 50 ? fallbackTitle.substring(0, 47) + '...' : fallbackTitle;
  }
};
