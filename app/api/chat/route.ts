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
    const { messages, events } = await request.json();

    const contextMessage =
      events.length > 0
        ? `Here are the recent events that have occurred during the video stream:\n${events
            .map(
              (event: any) =>
                `- At ${event.timestamp}: ${event.description}${event.isDangerous ? ' (⚠️ Dangerous)' : ''}`
            )
            .join(
              '\n'
            )}\n\nPlease help the user with any questions about these events or provide general assistance.`
        : 'No events have been detected yet. I can still help you with any questions about the video stream or general assistance.';

    console.log('Sending request to Gemini...');

    const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const chat = model.startChat({
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150,
      },
      history: [
        {
          role: 'user',
          parts: [
            {
              text: 'I need an assistant to help monitor a real-time video stream and provide guidance about events.',
            },
          ],
        },
        {
          role: 'model',
          parts: [
            {
              text: "I am a helpful assistant monitoring a real-time video stream. I have access to detected events and can provide guidance, especially during dangerous situations. I'll be concise but informative, and show appropriate concern for dangerous events while remaining calm and helpful.",
            },
          ],
        },
        {
          role: 'user',
          parts: [{ text: contextMessage }],
        },
        {
          role: 'model',
          parts: [
            {
              text: "I understand. I'll help with any questions about these events or provide general assistance.",
            },
          ],
        },
      ],
    });
    // We're only adding the user messages since we've already set up the initial context
    const userMessages = messages.filter((msg: any) => msg.role === 'user');

    // Get the last user message to send for the response
    const lastUserMessage =
      userMessages[userMessages.length - 1]?.content || '';

    // Send the message and get a response
    const result = await chat.sendMessage(lastUserMessage);
    const response = result.response;

    console.log('Successfully received response from Gemini');
    return NextResponse.json({
      content: response.text(),
      role: 'assistant',
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to get chat response: ${errorMessage}` },
      { status: 500 }
    );
  }
}
