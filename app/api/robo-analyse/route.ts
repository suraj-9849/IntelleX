import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    console.log('Received request at /api/analyze');

    const { imageData } = await req.json();
    if (!imageData) {
      return NextResponse.json(
        { error: 'Missing image data' },
        { status: 400 }
      );
    }

    console.log('Extracted imageData:', imageData.substring(0, 100) + '...');

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('Missing Google Gemini API key');
      return NextResponse.json(
        { error: 'Missing Google Gemini API key' },
        { status: 500 }
      );
    }

    const geminiAPI = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    console.log('Sending request to Gemini API...');
    const response = await axios.post(
      geminiAPI,
      {
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageData.split(',')[1],
                },
              },
            ],
          },
        ],
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    console.log(
      'Received response from Gemini API:',
      JSON.stringify(response.data, null, 2)
    );
    return NextResponse.json({ result: response.data });
  } catch (error: any) {
    console.error(
      'Error in Gemini API:',
      error.response?.data || error.message
    );
    return NextResponse.json(
      {
        error: 'Failed to analyze image',
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
