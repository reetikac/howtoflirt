import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Default personalization if not provided
const DEFAULT_PERSONALIZATION = {
  flirtStyle: 'playful',
  intensity: 5,
  userGender: 'guy',
  relationshipStage: 'early_days',
};

interface RequestBody {
  screenshot: string;
  context?: string;
  personalization?: {
    flirtStyle: string;
    intensity: number;
    userGender: string;
    relationshipStage: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { screenshot, context, personalization = DEFAULT_PERSONALIZATION } = body;

    if (!screenshot) {
      return NextResponse.json(
        { error: 'Screenshot is required' },
        { status: 400 }
      );
    }

    // Build personality description
    const styleDescriptions = {
      playful: 'witty, teasing, fun, emoji-heavy',
      smooth: 'confident, charming, sophisticated, minimal emojis',
      sweet: 'genuine, wholesome, caring, soft emojis',
      cocky: 'confident, sexy, bold, romantic with a seductive edge - never rude or dismissive, always making the other person feel desired',
    };

    const intensityDescription =
      personalization.intensity <= 3
        ? 'Subtle, could be friendly'
        : personalization.intensity <= 6
        ? 'Clear flirting, balanced'
        : 'Unmistakably romantic but still cute';

    const systemPrompt = `You are a flirting assistant helping a ${personalization.userGender} text someone they're interested in.

They are at the "${personalization.relationshipStage.replace('_', ' ')}" stage.

Your personality is ${personalization.flirtStyle}:
${styleDescriptions[personalization.flirtStyle as keyof typeof styleDescriptions]}

Intensity level: ${personalization.intensity}/10
${intensityDescription}

Analyze the conversation screenshot and generate 3 different ${personalization.flirtStyle} flirty text response options (10-25 words each).

${context ? `USER CONTEXT: ${context}` : ''}

REQUIREMENTS:
- ALL 3 options MUST be in the ${personalization.flirtStyle} style
- Each option should be a different variation/approach within the ${personalization.flirtStyle} vibe
- Natural, conversational tone (not overly polished)
- Match the existing conversation's energy level
- Emojis used sparingly and appropriately
- IMPORTANT: Never be rude, dismissive, or use negging - always make the other person feel desired and valued
- For cocky style: Be confident and sexy, not arrogant or mean
- Avoid: overtly sexual content, negging, generic compliments, dismissive language
- Keep responses short and engaging (10-25 words)

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "suggestions": [
    {
      "id": "1",
      "label": "option 1",
      "text": "your response here"
    },
    {
      "id": "2",
      "label": "option 2",
      "text": "your response here"
    },
    {
      "id": "3",
      "label": "option 3",
      "text": "your response here"
    }
  ]
}`;

    // Call Claude API with vision
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: screenshot,
              },
            },
            {
              type: 'text',
              text: systemPrompt,
            },
          ],
        },
      ],
    });

    // Parse response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Extract JSON from response
    let responseText = content.text.trim();

    // Remove markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Try to find JSON object in the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    // Validate response structure
    if (!parsedResponse.suggestions || !Array.isArray(parsedResponse.suggestions)) {
      throw new Error('Invalid response structure');
    }

    // Ensure all suggestions have required fields
    const suggestions = parsedResponse.suggestions.map((s: any, index: number) => ({
      id: s.id || String(index + 1),
      label: s.label || `option ${index + 1}`,
      text: s.text || 'Something went wrong, try again!',
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('API Error:', error);

    // Return fallback suggestions if API fails
    return NextResponse.json({
      suggestions: [
        {
          id: '1',
          label: 'option 1',
          text: 'haha okay but when are we actually meeting up? 👀',
        },
        {
          id: '2',
          label: 'option 2',
          text: 'i like your energy. let\'s keep this going over coffee?',
        },
        {
          id: '3',
          label: 'option 3',
          text: 'you seem really cool! would love to chat more in person',
        },
      ],
    });
  }
}
