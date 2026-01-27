'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';

export default function Home() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState('');

  const VALID_ACCESS_CODE = 'yesmycutie';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (accessCode.toLowerCase() === VALID_ACCESS_CODE.toLowerCase()) {
      setError('');
      router.push('/personalize');
    } else {
      setError('invalid code. try again 👀');
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-black overflow-hidden">
      {/* Dynamic neon gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-pink rounded-full blur-[120px] opacity-20 animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-purple rounded-full blur-[100px] opacity-25 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-neon-blue rounded-full blur-[90px] opacity-15 animate-pulse-glow" style={{ animationDelay: '4s' }} />

      <div className="max-w-md w-full space-y-12 animate-fade-in relative z-10">
        {/* Logo/Title Section */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl md:text-6xl font-light tracking-tight">
            <span className="bg-gradient-neon bg-200 bg-clip-text text-transparent animate-gradient-shift">
              how to flirt
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/70 font-light">
            let's get down 😉
          </p>
        </div>

        {/* Access Code Form */}
        <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
          <div className="relative">
            <input
              type="text"
              value={accessCode}
              onChange={(e) => {
                setAccessCode(e.target.value);
                setError(''); // Clear error when typing
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="enter access code"
              className={`
                w-full px-6 py-4 text-base font-light text-white placeholder-white/40
                bg-white/[0.05] backdrop-blur-sm
                border rounded-2xl
                transition-all duration-200
                focus:outline-none
                ${error
                  ? 'border-red-500/50 shadow-focus shadow-red-500/20'
                  : isFocused
                  ? 'border-neon-purple shadow-focus shadow-neon-glow bg-white/[0.08]'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                }
              `}
            />
            {error && (
              <p className="mt-2 text-sm text-red-400 font-light animate-fade-in">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!accessCode}
            className="w-full text-base font-medium disabled:opacity-40"
          >
            start flir...
          </Button>
        </form>

        {/* Disclaimer */}
        <p className="text-center text-white/30 text-xs font-light">
          we don't store any of your data nor ask for your personal details
        </p>
      </div>
    </main>
  );
}
