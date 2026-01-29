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
  mediaType?: string;
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
    const { screenshot, mediaType = 'image/jpeg', context, personalization: userPersonalization = DEFAULT_PERSONALIZATION } = body;
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
        playful: `PLAYFUL STYLE - GenZ Vibes:
- text like a real person - lowercase, casual, natural flow
- use GenZ slang naturally: "ngl", "fr fr", "lowkey", "highkey", "no cap"
- emojis that fit the vibe: 😏, 👀, 😭, 💀, 🙃, 😩
- be witty and teasing but never mean
- humor + wordplay + playful banter
- keep it fun and exciting
- Examples: "ngl you're living rent free in my head rn 👀", "okay so when are we gonna stop pretending we're just friends 😏", "you really just said that and thought i wouldn't catch feelings huh 😭"`,

        smooth: `SMOOTH STYLE - Effortlessly Cool:
- confident but never try-hard
- speak like you know your worth but you're chill about it
- minimal emojis, just one if it fits
- no caps, relaxed punctuation
- make them feel seen and special
- be charming without being cheesy
- Examples: "i like how you think", "you got my attention. now what", "something about you just hits different", "idk what it is but talking to you just feels right"`,

        sweet: `SWEET STYLE - Soft & Genuine:
- be real and wholesome
- show you actually care
- soft emojis that match the vibe: 🥰, ☺️, 💕, ✨
- genuine compliments that feel earned
- make them feel valued and appreciated
- warm but not overwhelming
- Examples: "you really made me smile today 🥰", "talking to you is honestly the best part of my day", "you're so easy to be around it's crazy", "i love how your brain works ngl"`,

        cocky: `COCKY STYLE - Bold & Seductive:
- be CONFIDENT and sexy without being cringe
- create tension and anticipation
- bold but tasteful - never rude
- make them feel DESIRED
- be direct about attraction
- keep it spicy but classy
- Examples: "ngl you're making it hard to focus on anything else", "you know exactly what you're doing to me don't you 😏", "the way you just— damn. yeah i'm in trouble", "can't lie you got me feeling some type of way rn"`
      };
      return descriptions[style] || descriptions['playful'];
    };

    // Detailed intensity descriptions
    const getIntensityDescription = (level: number) => {
      if (level <= 2) {
        return `INTENSITY 1-2 (keeping it chill):
- basically friendly with just a HINT of something more
- could be platonic tbh
- very light, testing waters
- safe and casual`;
      } else if (level <= 4) {
        return `INTENSITY 3-4 (lowkey flirting):
- slightly flirty but deniable
- friendly but with a lil something
- subtle interest showing through
- not too forward yet`;
      } else if (level <= 6) {
        return `INTENSITY 5-6 (definitely flirting):
- clearly into them, no question
- balanced - not too much but not too little
- confident but chill about it
- the vibe is there`;
      } else if (level <= 8) {
        return `INTENSITY 7-8 (bold energy):
- unmistakably flirting, no cap
- direct about being into them
- strong romantic/sexual tension
- confident and forward`;
      } else {
        return `INTENSITY 9-10 (all in):
- MAXIMUM flirt energy
- extremely direct and bold
- not holding back at all
- spicy but still classy
- make it OBVIOUS you're into them`;
      }
    };

    const systemPrompt = `You're helping a ${personalization.userGender} text someone they're into. Your job is to write texts that sound NATURAL and AUTHENTIC - like how GenZ actually texts.

USER INFO:
- They're a ${personalization.userGender}
- Relationship stage: ${personalization.relationshipStage.replace('_', ' ')}
- Their vibe: ${personalization.flirtStyle.toUpperCase()} (THIS IS THE MOST IMPORTANT - NAIL THIS STYLE)
- Intensity level: ${personalization.intensity}/10

${getStyleDescription(personalization.flirtStyle)}

${getIntensityDescription(personalization.intensity)}

${context ? `CONTEXT: ${context}` : ''}

HOW TO WRITE THESE TEXTS:
1. Read the screenshot conversation carefully - match their texting style
2. Text like a real ${personalization.userGender} would - not like a bot or a try-hard
3. Make each of the 3 responses DIFFERENT approaches (no repetition at all)
4. Keep it ${personalization.flirtStyle} style throughout - this is non-negotiable
5. Match the exact intensity ${personalization.intensity}/10 from above
6. Length: 10-25 words max (texts should be short and snappy)
7. Use lowercase, natural punctuation (or lack of it), GenZ slang when it fits
8. NEVER: be rude, use negging, be dismissive, sound fake
9. ALWAYS: make them feel good, desired, valued

Generate 3 completely different ${personalization.flirtStyle} text responses that sound like they came from a real person.

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
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
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
