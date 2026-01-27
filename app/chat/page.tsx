'use client';

import { useState, useRef } from 'react';
import Button from '@/components/Button';
import { usePersonalization } from '@/lib/PersonalizationContext';

interface Suggestion {
  id: string;
  label: string;
  text: string;
}

export default function ChatPage() {
  const { personalization } = usePersonalization();
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [context, setContext] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB');
      return;
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload PNG, JPG, or HEIC');
      return;
    }

    setScreenshot(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleGenerate = async () => {
    if (!screenshot) return;

    setIsAnalyzing(true);
    setError(null);
    setSuggestions(null);

    try {
      // Convert screenshot to base64
      const base64 = screenshotPreview?.split(',')[1];

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenshot: base64,
          context: context || undefined,
          personalization: {
            flirtStyle: personalization.flirtStyle || 'playful',
            intensity: personalization.intensity,
            userGender: personalization.userGender || 'guy',
            relationshipStage: personalization.relationshipStage || 'early_days',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      setError('Something went wrong. Try regenerating');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = async (suggestion: Suggestion) => {
    await navigator.clipboard.writeText(suggestion.text);
    setCopiedId(suggestion.id);
    setShowFeedback(true);

    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    // TODO: Send feedback to analytics
    setTimeout(() => setShowFeedback(false), 2000);
  };

  return (
    <main className="relative min-h-screen bg-black overflow-hidden pb-24">
      {/* Background gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-neon-pink rounded-full blur-[100px] opacity-15 animate-float" />
      <div className="absolute bottom-40 right-10 w-80 h-80 bg-neon-purple rounded-full blur-[110px] opacity-20 animate-pulse-glow" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-light mb-3">
            <span className="bg-gradient-neon bg-200 bg-clip-text text-transparent animate-gradient-shift">
              your flirt angel
            </span>{' '}
            <span className="text-white">💘</span>
          </h1>
          <p className="text-base text-white/60 font-light">
            upload a screenshot, we'll give you the perfect reply
          </p>
        </div>

        <div className="space-y-6">
          {/* Screenshot Upload */}
          <div className="animate-slide-up">
            <label className="block text-white/80 font-light mb-3">
              📸 conversation screenshot
            </label>

            {!screenshotPreview ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center cursor-pointer
                  hover:border-neon-purple hover:bg-white/5 transition-all duration-200"
              >
                <div className="text-4xl mb-4">📸</div>
                <p className="text-white/60 font-light mb-2">
                  Drag & drop or tap to upload
                </p>
                <p className="text-white/40 text-sm font-light">
                  Max 5MB • PNG, JPG, HEIC
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/heic"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                <img
                  src={screenshotPreview}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-white font-light text-sm mb-1">
                    {screenshot?.name}
                  </p>
                  <p className="text-white/40 text-xs">
                    {(screenshot!.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => {
                    setScreenshot(null);
                    setScreenshotPreview(null);
                    setSuggestions(null);
                  }}
                  className="text-white/60 hover:text-white text-sm font-light"
                >
                  change
                </button>
              </div>
            )}

            {error && (
              <p className="text-neon-pink text-sm mt-2 font-light">{error}</p>
            )}
          </div>

          {/* Context Input */}
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <label className="block text-white/80 font-light mb-3">
              add context (optional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value.slice(0, 150))}
              placeholder='e.g., "we matched yesterday" or "convo is dying, help!"'
              rows={3}
              className="w-full px-6 py-4 text-base font-light text-white placeholder-white/40
                bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl
                transition-all duration-200 focus:outline-none resize-none
                focus:border-neon-purple focus:shadow-focus"
            />
            <p className="text-white/40 text-xs mt-2 text-right font-light">
              {context.length}/150 characters
            </p>
          </div>

          {/* Generate Button */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Button
              onClick={handleGenerate}
              disabled={!screenshot || isAnalyzing}
              variant="primary"
              size="lg"
              className="w-full text-lg"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🪄</span> cooking up some fire...
                </span>
              ) : (
                <span>🪄 generate flirt suggestions</span>
              )}
            </Button>
          </div>

          {/* Suggestions */}
          {suggestions && (
            <div className="animate-slide-up space-y-4" style={{ animationDelay: '300ms' }}>
              <div className="text-center mb-6">
                <p className="text-white/60 font-light text-sm mb-2">your {personalization.flirtStyle || 'playful'} suggestions 💘</p>
                <p className="text-white/80 font-light">pick one 👇</p>
              </div>

              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10
                    hover:border-neon-purple hover:scale-[1.01] transition-all duration-200
                    relative group"
                  style={{ animationDelay: `${400 + index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-white/60 text-sm font-light">
                      {suggestion.label}
                    </span>
                    <button
                      onClick={() => handleCopy(suggestion)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                        ${copiedId === suggestion.id
                          ? 'bg-neon-purple text-white'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                    >
                      {copiedId === suggestion.id ? '✓ copied!' : 'copy'}
                    </button>
                  </div>
                  <p className="text-white font-light leading-relaxed">
                    {suggestion.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Feedback */}
          {showFeedback && suggestions && (
            <div className="animate-slide-up bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <p className="text-white/80 font-light mb-4">
                how'd it go? (helps us improve!)
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handleFeedback('positive')}
                  className={`px-8 py-3 rounded-2xl font-medium transition-all duration-200
                    ${feedback === 'positive'
                      ? 'bg-gradient-neon-subtle border border-neon-purple text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                >
                  👍 worked
                </button>
                <button
                  onClick={() => handleFeedback('negative')}
                  className={`px-8 py-3 rounded-2xl font-medium transition-all duration-200
                    ${feedback === 'negative'
                      ? 'bg-gradient-neon-subtle border border-neon-purple text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                >
                  👎 nah
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-12 text-center text-white/40 text-xs font-light">
          <p>use at your own discretion. we're not responsible for your love life 😅</p>
          <p className="mt-1">all screenshots are processed securely and never stored.</p>
        </div>
      </div>

      {/* Toast Notification */}
      {copiedId && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-neon-purple px-6 py-3 rounded-full shadow-neon-lg">
            <p className="text-white font-medium">✓ Copied to clipboard!</p>
          </div>
        </div>
      )}
    </main>
  );
}
