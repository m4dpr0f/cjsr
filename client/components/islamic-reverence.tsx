import React from 'react';

interface IslamicReverenceProps {
  text: string;
  className?: string;
}

// Component to display Islamic reverence symbols properly
export const IslamicReverence: React.FC<IslamicReverenceProps> = ({ text, className = "" }) => {
  // Add ﷺ (peace be upon him) after mentions of Prophet Muhammad
  const processedText = text
    .replace(/Muhammad(?!\s*ﷺ)/g, 'Muhammad ﷺ')
    .replace(/Prophet(?!\s*ﷺ|\s*Muhammad\s*ﷺ)/g, 'Prophet ﷺ')
    .replace(/Messenger(?!\s*ﷺ)/g, 'Messenger ﷺ')
    .replace(/Rasul(?!\s*ﷺ)/g, 'Rasul ﷺ')
    .replace(/النبي(?!\s*ﷺ)/g, 'النبي ﷺ')
    .replace(/رسول الله(?!\s*ﷺ)/g, 'رسول الله ﷺ');

  return (
    <span className={`${className} text-amber-100`} dir="auto">
      {processedText}
    </span>
  );
};

// Helper function for displaying Quranic verses with proper formatting
export const QuranVerse: React.FC<{
  arabic: string;
  translation: string;
  reference: string;
  className?: string;
}> = ({ arabic, translation, reference, className = "" }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-right" dir="rtl">
        <p className="text-xl text-amber-200 font-arabic leading-relaxed">
          {arabic}
        </p>
      </div>
      <div className="text-left">
        <p className="text-lg text-white italic">
          "{translation}"
        </p>
      </div>
      <p className="text-sm text-gray-400 text-center">
        — {reference}
      </p>
    </div>
  );
};

// Helper function for displaying Hadith with proper attribution
export const HadithText: React.FC<{
  arabic?: string;
  translation: string;
  narrator: string;
  source: string;
  className?: string;
}> = ({ arabic, translation, narrator, source, className = "" }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {arabic && (
        <div className="text-right" dir="rtl">
          <p className="text-lg text-amber-200 font-arabic leading-relaxed">
            {arabic}
          </p>
        </div>
      )}
      <div className="text-left">
        <p className="text-lg text-white">
          <IslamicReverence text={`"${translation}"`} />
        </p>
      </div>
      <div className="text-sm text-gray-400 text-center space-y-1">
        <p>Narrated by {narrator}</p>
        <p>— {source}</p>
      </div>
    </div>
  );
};

export default IslamicReverence;