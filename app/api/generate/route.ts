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
  let personalization = DEFAULT_PERSONALIZATION;

  try {
    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'API key not configured. Please set ANTHROPIC_API_KEY in Vercel environment variables.' },
        { status: 500 }
      );
    }

    const body: RequestBody = await request.json();
    const { screenshot, context, personalization: userPersonalization = DEFAULT_PERSONALIZATION } = body;
    personalization = userPersonalization;

    if (!screenshot) {
      return NextResponse.json(
        { error: 'Screenshot is required' },
        { status: 400 }
      );
    }

    // Detailed style descriptions with strong emphasis
    const getStyleDescription = (style: string) => {
      const descriptions: { [key: string]: string } = {
        playful: `PLAYFUL STYLE - THIS IS CRITICAL:
- Be witty, teasing, and fun
- Use playful banter and light teasing (never mean)
- Include emojis naturally (😏, 👀, 😉, 🙃)
- Create a sense of fun and excitement
- Use humor and wordplay
- Keep it lighthearted but flirty
- Examples: "oh so you're trouble huh? 👀", "damn okay i see you being all cute and stuff 😏"`,

        smooth: `SMOOTH STYLE - THIS IS CRITICAL:
- Be confident, charming, and sophisticated
- Use minimal emojis (maybe one subtle one)
- Sound naturally confident without being arrogant
- Be effortlessly cool and composed
- Use sophisticated language but keep it natural
- Make them feel special and noticed
- Examples: "i like the way you think", "you've got my attention. what's next?"`,

        sweet: `SWEET STYLE - THIS IS CRITICAL:
- Be genuine, wholesome, and caring
- Show real interest and warmth
- Use soft, cute emojis sparingly (🥰, ☺️, 💕)
- Be affectionate but not over the top
- Express genuine feelings and compliments
- Make them feel valued and appreciated
- Examples: "you really made me smile today 🥰", "i love talking to you, you're so easy to be around"`,

        cocky: `COCKY STYLE - THIS IS CRITICAL:
- Be SEXY, confident, and seductive
- Project strong sexual tension and desire
- Be bold and direct about attraction
- Use language that's provocative but tasteful
- Make them feel WANTED and desired intensely
- Never be rude or dismissive - always appreciative
- Create anticipation and excitement
- Examples: "you're making it really hard to focus on anything else", "damn. you know exactly what you're doing to me don't you"`
      };
      return descriptions[style] || descriptions['playful'];
    };

    // Detailed intensity descriptions
    const getIntensityDescription = (level: number) => {
      if (level <= 2) {
        return `INTENSITY 1-2 (VERY SUBTLE):
- Could easily be interpreted as friendly
- Minimal romantic signals
- Safe, almost platonic with a tiny hint of interest
- Very light compliments if any`;
      } else if (level <= 4) {
        return `INTENSITY 3-4 (SUBTLE FLIRTING):
- Gentle hints of romantic interest
- Friendly but with slight flirty undertones
- Subtle compliments and interest
- Testing the waters carefully`;
      } else if (level <= 6) {
        return `INTENSITY 5-6 (CLEAR FLIRTING):
- Obviously flirty but balanced
- Clear romantic interest
- Confident but not overwhelming
- Balanced between playful and serious`;
      } else if (level <= 8) {
        return `INTENSITY 7-8 (BOLD & DIRECT):
- Unmistakably romantic and forward
- Strong, direct flirting
- Clear sexual/romantic tension
- Confident and assertive about interest`;
      } else {
        return `INTENSITY 9-10 (ALL OUT):
- MAXIMUM romantic/sexual tension
- Extremely direct and bold
- No holding back on desire and attraction
- Push boundaries while staying tasteful
- Make your interest UNDENIABLE`;
      }
    };

    const systemPrompt = `You are an expert flirting assistant. You MUST follow these instructions EXACTLY.

USER PROFILE (FOLLOW STRICTLY):
- Gender: ${personalization.userGender}
- Relationship Stage: ${personalization.relationshipStage.replace('_', ' ')}
- Flirt Style: ${personalization.flirtStyle.toUpperCase()} (THIS HAS THE MOST WEIGHT - FOLLOW IT PRECISELY)
- Intensity: ${personalization.intensity}/10

${getStyleDescription(personalization.flirtStyle)}

${getIntensityDescription(personalization.intensity)}

${context ? `ADDITIONAL CONTEXT FROM USER: ${context}` : ''}

CRITICAL INSTRUCTIONS:
1. ANALYZE the conversation screenshot carefully
2. Consider the ${personalization.userGender}'s perspective and how they would naturally text
3. Generate 3 DIFFERENT and VARIED responses - NO REPETITION
4. STRICTLY follow the ${personalization.flirtStyle} style - this is the most important factor
5. Match the intensity level ${personalization.intensity}/10 EXACTLY as described above
6. Each response should take a different angle/approach while staying in the ${personalization.flirtStyle} style
7. Keep responses natural and conversational (10-25 words)
8. NEVER be rude, dismissive, or use negging
9. Make the other person feel desired and valued

Generate 3 completely different ${personalization.flirtStyle} responses now.

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
      max_tokens: 2048,
      temperature: 1.0, // Maximum creativity for varied responses
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
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      personalization: personalization,
      hasApiKey: !!process.env.ANTHROPIC_API_KEY,
    });

    // Return error response instead of fallback
    return NextResponse.json(
      {
        error: 'Failed to generate suggestions. Check Vercel logs for details.',
        details: error instanceof Error ? error.message : 'Unknown error',
        hasApiKey: !!process.env.ANTHROPIC_API_KEY,
      },
      { status: 500 }
    );
  }
}
