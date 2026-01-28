'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { usePersonalization } from '@/lib/PersonalizationContext';

type Gender = 'guy' | 'girl' | 'other' | null;
type RelationshipStage = 'first_message' | 'early_days' | 'getting_fun' | 'convo_dying' | null;
type FlirtStyle = 'playful' | 'smooth' | 'sweet' | 'cocky' | null;

interface PersonalizationData {
  userGender: Gender;
  userAge: string;
  relationshipStage: RelationshipStage;
  flirtStyle: FlirtStyle;
  intensity: number;
}

const relationshipStages = [
  { value: 'first_message', emoji: '👋', title: 'first message', desc: 'breaking the ice' },
  { value: 'early_days', emoji: '🌱', title: 'early days', desc: 'getting to know them' },
  { value: 'getting_fun', emoji: '✨', title: 'getting fun', desc: 'vibes are there' },
  { value: 'convo_dying', emoji: '💀', title: 'convo dying', desc: 'need to revive it' },
];

const flirtStyles = [
  { value: 'playful', emoji: '🎮', title: 'playful', desc: 'witty, teasing, fun with lots of banter' },
  { value: 'smooth', emoji: '😎', title: 'smooth', desc: 'effortlessly confident & charming' },
  { value: 'sweet', emoji: '🥰', title: 'sweet', desc: 'genuine, warm & affectionate' },
  { value: 'cocky', emoji: '🔥', title: 'cocky', desc: 'sexy, bold & seductive' },
];

export default function PersonalizePage() {
  const router = useRouter();
  const { setPersonalization } = usePersonalization();

  const [data, setData] = useState<PersonalizationData>({
    userGender: null,
    userAge: '',
    relationshipStage: null,
    flirtStyle: null,
    intensity: 5,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isValid = data.userGender && data.userAge && data.relationshipStage && data.flirtStyle;

  const handleSubmit = () => {
    const newErrors: { [key: string]: string } = {};

    if (!data.userGender) newErrors.gender = 'pick your gender';
    if (!data.userAge) newErrors.age = 'we need your age';
    if (!data.relationshipStage) newErrors.stage = 'what stage are you at?';
    if (!data.flirtStyle) newErrors.style = 'pick your vibe';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save to context
    setPersonalization(data);
    console.log('Personalization data:', data);
    router.push('/chat'); // Navigate to chat screen
  };

  return (
    <main className="relative min-h-screen bg-black overflow-hidden pb-32">
      {/* Background gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-neon-pink rounded-full blur-[100px] opacity-15 animate-float" />
      <div className="absolute bottom-40 right-10 w-80 h-80 bg-neon-purple rounded-full blur-[110px] opacity-20 animate-pulse-glow" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-light mb-3">
            <span className="bg-gradient-neon bg-200 bg-clip-text text-transparent animate-gradient-shift">
              let's vibe check
            </span>{' '}
            <span className="text-white">😏</span>
          </h1>
          <p className="text-lg text-white/60 font-light">
            tell us about you - we'll match your energy
          </p>
        </div>

        <div className="space-y-10">
          {/* Gender Selection */}
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <label className="block text-white/80 font-light mb-3">i'm a...</label>
            <div className="flex gap-3">
              {['guy', 'girl'].map((gender) => (
                <button
                  key={gender}
                  onClick={() => {
                    setData({ ...data, userGender: gender as Gender });
                    setErrors({ ...errors, gender: '' });
                  }}
                  className={`
                    flex-1 px-6 py-4 rounded-2xl font-medium transition-all duration-200
                    ${data.userGender === gender
                      ? 'bg-gradient-neon-subtle border border-neon-purple/50 text-white shadow-neon'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                    }
                  `}
                >
                  {gender}
                </button>
              ))}
            </div>
            {errors.gender && (
              <p className="text-neon-pink text-sm mt-2 font-light">{errors.gender}</p>
            )}
          </div>

          {/* Age Input */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <label className="block text-white/80 font-light mb-3">i'm ___ years old</label>
            <input
              type="number"
              value={data.userAge}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 2) {
                  setData({ ...data, userAge: value });
                  setErrors({ ...errors, age: '' });
                }
              }}
              placeholder="18"
              min="18"
              max="99"
              maxLength={2}
              className={`
                w-full px-6 py-4 text-base font-light text-white placeholder-white/40
                bg-white/5 backdrop-blur-sm
                border rounded-2xl
                transition-all duration-200
                focus:outline-none
                ${errors.age
                  ? 'border-neon-pink'
                  : 'border-white/10 focus:border-neon-purple focus:shadow-focus hover:border-white/20'
                }
              `}
            />
            {errors.age && (
              <p className="text-neon-pink text-sm mt-2 font-light">{errors.age}</p>
            )}
          </div>

          {/* Relationship Stage */}
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <label className="block text-white/80 font-light mb-3">where are you at?</label>
            <div className="grid grid-cols-2 gap-3">
              {relationshipStages.map((stage) => (
                <button
                  key={stage.value}
                  onClick={() => {
                    setData({ ...data, relationshipStage: stage.value as RelationshipStage });
                    setErrors({ ...errors, stage: '' });
                  }}
                  className={`
                    p-4 rounded-2xl text-left transition-all duration-200
                    ${data.relationshipStage === stage.value
                      ? 'bg-gradient-neon-subtle border border-neon-purple/50 shadow-neon'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                    }
                  `}
                >
                  <div className="text-lg mb-2">{stage.emoji}</div>
                  <div className="text-white font-medium">{stage.title}</div>
                  <div className="text-white/50 text-sm font-light">{stage.desc}</div>
                </button>
              ))}
            </div>
            {errors.stage && (
              <p className="text-neon-pink text-sm mt-2 font-light">{errors.stage}</p>
            )}
          </div>

          {/* Flirt Style - Main Selection */}
          <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
            <label className="block text-white/80 font-light mb-3">
              what's your vibe? <span className="text-neon-purple">(pick one)</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flirtStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => {
                    setData({ ...data, flirtStyle: style.value as FlirtStyle });
                    setErrors({ ...errors, style: '' });
                  }}
                  className={`
                    p-6 rounded-2xl text-left transition-all duration-200
                    ${data.flirtStyle === style.value
                      ? 'bg-gradient-neon-subtle border-2 border-neon-purple shadow-neon-lg scale-[1.02]'
                      : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]'
                    }
                  `}
                >
                  <div className="text-2xl mb-3">{style.emoji}</div>
                  <div className="text-xl font-medium text-white mb-1">{style.title}</div>
                  <div className="text-white/60 text-sm font-light">{style.desc}</div>
                </button>
              ))}
            </div>
            {errors.style && (
              <p className="text-neon-pink text-sm mt-2 font-light">{errors.style}</p>
            )}
          </div>

          {/* Intensity Slider */}
          <div className="animate-slide-up" style={{ animationDelay: '500ms' }}>
            <div className="flex justify-between items-center mb-3">
              <label className="text-white/80 font-light">intensity level</label>
              <span className="text-neon-purple font-medium">{data.intensity}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={data.intensity}
              onChange={(e) => setData({ ...data, intensity: parseInt(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-neon-subtle
                [&::-webkit-slider-thumb]:shadow-neon [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-white/40 font-light">subtle (1-2)</span>
              <span className="text-xs text-white/40 font-light">all out (10)</span>
            </div>
            <div className="mt-3 text-center">
              <p className="text-sm text-neon-purple font-light">
                {data.intensity <= 2 && "very subtle - almost friendly"}
                {data.intensity > 2 && data.intensity <= 4 && "gentle hints of interest"}
                {data.intensity > 4 && data.intensity <= 6 && "clear flirting, balanced"}
                {data.intensity > 6 && data.intensity <= 8 && "bold & direct"}
                {data.intensity > 8 && "maximum romantic tension 🔥"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black to-transparent p-6 z-20">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            variant="primary"
            size="lg"
            className={`w-full text-lg ${isValid ? 'animate-pulse-glow' : ''}`}
          >
            let's flir... 💘
          </Button>
        </div>
      </div>
    </main>
  );
}
