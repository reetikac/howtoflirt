'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface PersonalizationData {
  userGender: string | null;
  relationshipStage: string | null;
  flirtStyle: string | null;
  intensity: number;
}

interface PersonalizationContextType {
  personalization: PersonalizationData;
  setPersonalization: (data: PersonalizationData) => void;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export function PersonalizationProvider({ children }: { children: ReactNode }) {
  const [personalization, setPersonalization] = useState<PersonalizationData>({
    userGender: null,
    relationshipStage: null,
    flirtStyle: null,
    intensity: 5,
  });

  return (
    <PersonalizationContext.Provider value={{ personalization, setPersonalization }}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (context === undefined) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
}
