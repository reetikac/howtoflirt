# 💬 Main Chat Screen - Detailed Specification

## Overview
This is the core feature where users upload conversation screenshots, get AI-powered flirty responses, and copy their favorite suggestion.

---

## 🎨 Screen Layout (Mobile-First)

### **Header**
- Title: "your flirt buddy 💕"
- Subtitle: "upload a screenshot, we'll give you the perfect reply"
- Back button (top-left) → returns to personalization

### **Main Content Area**

#### **Section 1: Screenshot Upload**
```
┌─────────────────────────────────────┐
│  📸 Upload Conversation Screenshot  │
│                                     │
│  [  Drag & drop or tap to upload  ]│
│                                     │
│  Max 5MB • PNG, JPG, HEIC           │
└─────────────────────────────────────┘
```

**States:**
- **Empty:** Dashed border, upload icon, prompt text
- **Uploading:** Loading spinner, "analyzing..." text
- **Uploaded:** Preview thumbnail (100px height), "change" button, file name

**Validation:**
- Max 5MB file size
- Accepted formats: PNG, JPG, JPEG, HEIC
- Error messages inline (red text below upload area)
- take only 1 image

---

#### **Section 2: Context Input (Optional)**
```
┌─────────────────────────────────────┐
│  add context (optional)             │
│  ┌───────────────────────────────┐ │
│  │ e.g., "we matched yesterday"  │ │
│  │ or "convo is dying, help!"    │ │
│  └───────────────────────────────┘ │
│  0/150 characters                   │
└─────────────────────────────────────┘
```

**Features:**
- Multi-line textarea (max 150 chars)
- Character counter (updates live)
- Placeholder examples rotate on focus
- Optional, can skip

---

#### **Section 3: Generate Button**
```
┌─────────────────────────────────────┐
│  [ 🪄 generate flirt suggestions ]  │
└─────────────────────────────────────┘
```

**Button States:**
- **Disabled:** Gray, opacity 40% (no screenshot uploaded)
- **Enabled:** Gradient pink→purple, shadow-neon
- **Loading:** Spinner inside button, "cooking up some fire..."
- **Success:** Brief checkmark animation, then show suggestions

---

#### **Section 4: AI Suggestions (After Generation)**
```
┌─────────────────────────────────────┐
│  pick your vibe 👇                  │
│                                     │
│  ┌─ Option 1 ─────────────────────┐│
│  │ 😏 playful                      ││
│  │ "haha okay but when are we      ││
│  │ actually getting coffee? 👀"    ││
│  │                    [ copy ]     ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─ Option 2 ─────────────────────┐│
│  │ 😎 smooth                       ││
│  │ "i like your energy. let's keep ││
│  │ this going over drinks?"        ││
│  │                    [ copy ]     ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─ Option 3 ─────────────────────┐│
│  │ 🥰 sweet                        ││
│  │ "you seem really cool! would    ││
│  │ love to chat more in person"    ││
│  │                    [ copy ]     ││
│  └─────────────────────────────────┘│
│                                     │
│  [ ↻ regenerate suggestions ]      │
└─────────────────────────────────────┘
```

**Suggestion Card Design:**
- White/10 background with border
- Hover: slight scale (1.02), brighter background
- Selected: Gradient border, neon glow
- Emoji + label (style name) at top
- Suggestion text (10-25 words)
- Copy button (top-right of card)

**Copy Button:**
- On click: Copies text to clipboard
- Shows "copied!" toast notification (2s)
- Confetti animation (optional, playful touch)

**Regenerate Button:**
- Below all suggestions
- Ghost style (transparent, white/60 text)
- On click: Generate 3 new options
- Loading state while regenerating

---

#### **Section 5: Feedback (After Copy)**
```
┌─────────────────────────────────────┐
│  how'd it go? (helps us improve!)  │
│  [  👍 worked  ]  [  👎 nah  ]     │
└─────────────────────────────────────┘
```

**Features:**
- Appears after user copies a suggestion
- Optional, can skip
- Thumbs up/down selection
- Selection highlighted (gradient background)
- Submits feedback silently (no page reload)

---

## 🔧 Technical Implementation

### **State Management**
```typescript
interface ChatState {
  screenshot: File | null;
  screenshotPreview: string | null;
  context: string;
  isAnalyzing: boolean;
  suggestions: Suggestion[] | null;
  selectedSuggestion: number | null;
  feedback: 'positive' | 'negative' | null;
}

interface Suggestion {
  id: string;
  style: 'playful' | 'smooth' | 'sweet' | 'cocky';
  emoji: string;
  text: string;
}
```

### **File Upload Flow**
1. User selects file (input or drag-drop)
2. Validate file size (<5MB) and type
3. Create preview with FileReader
4. Store File object in state
5. Enable "generate" button

### **AI Generation Flow**
1. User clicks "generate flirt suggestions"
2. Show loading state
3. Send to API route `/api/generate`:
   - Screenshot (base64 or FormData)
   - Context text (optional)
   - User personalization data (from state/context)
4. API processes:
   - Extract text from screenshot (OCR or Claude vision)
   - Build system prompt with user's flirt style
   - Call Claude API with vision
   - Parse 3 suggestions from response
5. Display suggestions
6. User copies one → show feedback prompt

### **API Route Structure**
```typescript
// app/api/generate/route.ts
POST /api/generate
Body: {
  screenshot: string (base64),
  context?: string,
  personalization: {
    flirtStyle: string,
    intensity: number,
    userGender: string,
    relationshipStage: string
  }
}

Response: {
  suggestions: [
    { id, style, emoji, text },
    { id, style, emoji, text },
    { id, style, emoji, text }
  ]
}
```

### **Claude API Integration**
```typescript
const systemPrompt = `You are a flirting assistant helping a ${userGender} text with the opposite gender.

They are at the ${relationshipStage} stage.

Your personality is ${flirtStyle}:
- playful: witty, teasing, fun, emoji-heavy
- smooth: confident, charming, sophisticated, minimal emojis
- sweet: genuine, wholesome, caring, soft emojis
- cocky: direct, spicy, confident, provocative but tasteful

Intensity level: ${intensity}/10
- 1-3: Subtle, could be friendly
- 4-6: Clear flirting, balanced
- 7-10: Unmistakably romantic but still cute

Generate 3 flirty text responses (10-25 words each) that match this personality.

CONVERSATION SCREENSHOT:
[Image provided]

${context ? `USER CONTEXT: ${context}` : ''}

Return JSON:
{
  "suggestions": [
    {"style": "playful", "emoji": "😏", "text": "..."},
    {"style": "smooth", "emoji": "😎", "text": "..."},
    {"style": "sweet", "emoji": "🥰", "text": "..."}
  ]
}`;

const response = await anthropic.messages.create({
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
            data: screenshotBase64,
          },
        },
        { type: 'text', text: systemPrompt },
      ],
    },
  ],
});
```

---

## 🎨 Design Specifications

### **Colors**
- Background: `#000000`
- Card backgrounds: `rgba(255,255,255,0.05)`
- Selected card: Gradient border `#F72585` → `#B794F6`
- Text: `rgba(255,255,255,0.9)`
- Muted text: `rgba(255,255,255,0.6)`

### **Spacing**
- Section gap: `24px`
- Card padding: `20px`
- Card gap: `16px`
- Screen padding: `24px`

### **Typography**
- Title: `text-4xl font-light`
- Subtitle: `text-lg font-light opacity-60`
- Section labels: `text-base font-light opacity-80`
- Suggestions: `text-base font-normal`
- Button text: `text-base font-medium`

### **Animations**
- Upload area: Pulse border on hover
- Suggestions: Slide up + fade in (stagger 100ms)
- Copy button: Scale + checkmark animation
- Toast notification: Slide in from bottom
- Regenerate: Rotate icon 360° on click

---

## 📱 Responsive Behavior

### **Mobile (<640px)**
- Single column layout
- Suggestions stack vertically
- Copy button inside card (right side)
- Upload area full width

### **Tablet/Desktop (>640px)**
- Max width: `600px`, centered
- Suggestions still stack (easier to read)
- Larger preview thumbnail (150px)

---

## 🔒 Privacy & Safety

### **File Handling**
- Files processed in memory only
- Never saved to disk/database
- Base64 encoded for API transmission
- Deleted from memory after response

### **Content Moderation**
- Check for explicit content (optional: use Claude to analyze)
- Block if detected, show error message
- Age verification required (18+ from onboarding)

### **Error Handling**
- Network errors: "Oops! Check your connection and try again"
- API errors: "Something went wrong. Try regenerating"
- File too large: "File must be under 5MB"
- Invalid format: "Please upload PNG, JPG, or HEIC"

### **Disclaimer (Footer)**
```
"use at your own discretion. we're not responsible for your love life 😅
all screenshots are processed securely and never stored."
```

---

## ✅ Acceptance Criteria

- [ ] Upload screenshot (drag-drop + click)
- [ ] Validate file size and format
- [ ] Show preview after upload
- [ ] Context input with character counter
- [ ] Generate button disabled until screenshot uploaded
- [ ] Loading state during AI generation
- [ ] Display 3 distinct suggestions
- [ ] Copy to clipboard with toast notification
- [ ] Regenerate suggestions feature
- [ ] Feedback system (thumbs up/down)
- [ ] Mobile responsive
- [ ] Error states handled gracefully
- [ ] Privacy-first (no data storage)

---

## 🚀 Future Enhancements (Post-MVP)

- Multiple screenshot support
- Voice input for context
- "Save favorite suggestions" (local storage)
- Share suggestions with friends
- A/B test different prompt strategies
- Conversation history (if user consents)
- Premium: Unlimited regenerations

---

## 📝 Example User Flow

1. User lands on chat screen
2. Taps upload area, selects screenshot from camera roll
3. Screenshot appears as thumbnail
4. Types context: "we matched yesterday, she seems cool"
5. Clicks "generate flirt suggestions"
6. Sees 3 options appear (playful, smooth, sweet)
7. Likes option 2, clicks "copy"
8. Pastes into dating app, sends message
9. Comes back, clicks 👍 (worked!)
10. Uploads another screenshot to continue...

---

This spec covers everything! Ready to build it? 🔥
