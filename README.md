# How to Flirt 💕

A GenZ dating app that helps you write better flirty texts with AI assistance.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Y2K-inspired styling with neon gradients
- **Framer Motion** - Smooth animations
- **Claude API** - AI-powered text suggestions

## Design Aesthetic

Y2K inspired with:
- Neon gradients (hot pink, purple, electric blue)
- Bubbly, playful typography
- Glossy buttons with animations
- Dark mode with neon accents
- Very GenZ energy

## Getting Started

### Prerequisites

- Node.js 18.17 or higher
- npm or yarn
- Anthropic API key (get from [console.anthropic.com](https://console.anthropic.com/))

### Installation

```bash
# Install dependencies
npm install

# Add your Claude API key to .env.local
# Edit .env.local and replace 'your_api_key_here' with your actual key
# ANTHROPIC_API_KEY=sk-ant-...

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### User Flow

1. **Home Screen** (`/`) - Enter access code
2. **Personalization** (`/personalize`) - Set your vibe (gender, age, stage, flirt style, intensity)
3. **Chat Screen** (`/chat`) - Upload screenshot, get AI suggestions, copy & send!

### Features Implemented

✅ Access code entry screen
✅ Complete personalization flow with 5 inputs
✅ Screenshot upload (drag & drop or click)
✅ Claude API integration with vision
✅ 3 AI-generated flirty suggestions
✅ Copy to clipboard with toast notification
✅ Regenerate suggestions
✅ Feedback system (thumbs up/down)
✅ Mobile-first responsive design
✅ Neon GenZ aesthetic with animations

## Project Structure

```
how_to_flirt/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── onboarding/        # Onboarding flow (coming soon)
├── components/            # Reusable components
└── lib/                   # Utilities and API clients
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## MVP Features

- Stateless architecture (no database)
- Mobile-first responsive design
- AI-powered flirty text suggestions
- Real-time text analysis
- Vibe selection and customization

---

Built with 💕 for the GenZ dating scene
