import React from 'react';
import { SupportedLanguage } from '../types';

interface EmptyChatStateProps {
  speechLang: SupportedLanguage;
}

export const EmptyChatState: React.FC<EmptyChatStateProps> = ({
  speechLang,
}) => {
  const isUrdu = speechLang === 'ur-PK';

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 w-full text-center">
      <h1 className="text-2xl font-medium tracking-tight mb-2 text-white">
        NOVA AI
      </h1>
      <p className="text-base text-[#a0a0a0]">
        {isUrdu ? 'آج میں آپ کی کیا مدد کر سکتا ہوں؟' : 'How can I help you today?'}
      </p>
    </div>
  );
};
