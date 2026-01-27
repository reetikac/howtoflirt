import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  animated?: boolean;
}

export default function Card({ children, className = '', animated = false }: CardProps) {
  return (
    <div className={`card-neon ${animated ? 'animate-float' : ''} ${className}`}>
      {children}
    </div>
  );
}
