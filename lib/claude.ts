import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface FlirtSuggestionRequest {
  originalText: string;
  vibe: 'playful' | 'confident' | 'sweet' | 'mysterious' | 'funny';
  context?: string;
}

export interface FlirtSuggestion {
  text: string;
  explanation: string;
  confidence: number;
}

export async function getFlirtSuggestions(
  request: FlirtSuggestionRequest
): Promise<FlirtSuggestion[]> {
  const prompt = `You're a GenZ dating coach helping someone write a flirty text.

Original text: "${request.originalText}"
Desired vibe: ${request.vibe}
${request.context ? `Context: ${request.context}` : ''}

Provide 3 improved versions of this text that are:
- More flirty and engaging
- Match the ${request.vibe} vibe
- Natural and not cringy
- GenZ appropriate

Format as JSON array with objects containing:
- text: the improved version
- explanation: brief explanation of why it works (1 sentence)
- confidence: score 1-10`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      // Parse the response
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error('Failed to parse suggestions');
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}
