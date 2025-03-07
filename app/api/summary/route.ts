import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const getGeminiClient = () => {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not found in environment variables');
  }
  return new GoogleGenerativeAI(apiKey);
};

export async function POST(request: Request) {
  let geminiClient;
  try {
    geminiClient = getGeminiClient();
  } catch (error) {
    console.error('Gemini client initialization error:', error);
    return NextResponse.json(
      { error: 'Gemini API key not properly configured' },
      { status: 500 }
    );
  }

  try {
    const { keyMoments } = await request.json();
    const momentsText = keyMoments
      .map(
        (moment: any) =>
          `Video: ${moment.videoName}\nTimestamp: ${moment.timestamp}\nDescription: ${moment.description}\nDangerous: ${moment.isDangerous ? 'Yes' : 'No'}\n`
      )
      .join('\n');

    const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `Here are the key moments from video analysis sessions. Please provide a concise summary of the important events and any safety concerns:

${momentsText}

Please format your response in this way:
1. Overall Summary (2-3 sentences)
2. Key Safety Concerns (if any)
3. Notable Patterns (if any)`;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const response = result.response;
    const summary = response.text();

    return NextResponse.json({
      summary: summary || 'Unable to generate summary.',
    });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    const errorMessage = error.message || 'Failed to generate summary';
    return NextResponse.json(
      {
        error: errorMessage,
        details:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
