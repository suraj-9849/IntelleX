'use server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Array of API keys
const API_KEYS = [
  process.env.GOOGLE_API_KEY_1,
  process.env.GOOGLE_API_KEY_2,
  process.env.GOOGLE_API_KEY_3,
  process.env.GOOGLE_API_KEY_4,
  process.env.GOOGLE_API_KEY_5,
  process.env.GOOGLE_API_KEY_6,
  process.env.GOOGLE_API_KEY_7,
  process.env.GOOGLE_API_KEY_9,
  process.env.GOOGLE_API_KEY_10,
].filter(Boolean) as string[];

let currentKeyIndex = 0;
function getNextApiKey() {
  if (!API_KEYS.length) throw new Error('No valid API keys available');
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}

export interface VideoEvent {
  description: string;
  isDangerous: boolean;
  timestamp: string;
}

export async function detectEvents(
  imageBlob: Blob
): Promise<{ events: VideoEvent[]; rawResponse: string }> {
  if (!imageBlob) throw new Error('No image data provided');

  const API_KEY = getNextApiKey();
  console.log(`Using API key index: ${currentKeyIndex}`);

  const prompt = `Analyze this frame and determine if any of these specific dangerous situations are occurring:
1. Medical Emergencies:
- Person unconscious or lying motionless
- Person clutching chest/showing signs of heart problems
- Seizures or convulsions
- Difficulty breathing or choking
2. Falls and Injuries:
- Person falling or about to fall
- Person on the ground after a fall
- Signs of injury or bleeding
- Limping or showing signs of physical trauma
3. Distress Signals:
- Person calling for help or showing distress
- Panic attacks or severe anxiety symptoms
- Signs of fainting or dizziness
- Headache or unease
- Signs of unconsciousness
4. Violence or Threats:
- Physical altercations
- Threatening behavior
- Weapons visible
5. Suspicious Activities:
- Shoplifting
- Vandalism
- Trespassing
Return a JSON object in this exact format:
{
    "events": [
        {
            "timestamp": "mm:ss",
            "description": "Brief description of what's happening in this frame",
            "isDangerous": true/false // Set to true if the event involves a fall, injury, unease, pain, accident, or concerning behavior
        }
    ]
}`;

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
    generationConfig: {
      temperature: 0,
      topP: 0.1,
      topK: 16,
      maxOutputTokens: 300,
    },
  });
  console.log('Initialized Gemini model with generationConfig');

  const bytes = new Uint8Array(await imageBlob.arrayBuffer());
  console.log(`Image size in bytes: ${bytes.length}`);

  const imagePart = {
    inlineData: {
      data: Buffer.from(bytes).toString('base64'),
      mimeType: 'image/jpeg',
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  const text = await response.text();
  console.log('Raw API Response:', text);

  let jsonStr = text;
  const codeMatch = text.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
  if (codeMatch) {
    jsonStr = codeMatch[1];
  } else {
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) jsonStr = objMatch[0];
  }

  const parsed = JSON.parse(jsonStr);
  const events = parsed.events ?? [];
  const eventsWithTimestamps: VideoEvent[] = events.map((e: any) => ({
    description: e.description,
    isDangerous: e.isDangerous,
    timestamp: '',
  }));

  return { events: eventsWithTimestamps, rawResponse: text };
}