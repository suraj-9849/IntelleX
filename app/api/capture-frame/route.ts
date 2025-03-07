import { type NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'buffer';

export async function POST(request: NextRequest) {
  try {
    const { streamUrl } = await request.json();

    if (!streamUrl) {
      return NextResponse.json(
        { error: 'Stream URL is required' },
        { status: 400 }
      );
    }
    const response = await fetch(streamUrl, {
      headers: {
        Accept: 'image/jpeg',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from stream: ${response.statusText}` },
        { status: 500 }
      );
    }
    const imageBuffer = await response.arrayBuffer();
    const base64Data = Buffer.from(imageBuffer).toString('base64');
    const frameData = `data:image/jpeg;base64,${base64Data}`;
    return NextResponse.json({ frameData });
  } catch (error) {
    console.error('Error capturing frame:', error);
    return NextResponse.json(
      { error: 'Failed to capture frame from stream' },
      { status: 500 }
    );
  }
}
