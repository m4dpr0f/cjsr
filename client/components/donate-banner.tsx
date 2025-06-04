import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import bannerImage from '@assets/CJSRAppFund.png';

export function DonateBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Always show the banner initially, regardless of previous dismissals
  useEffect(() => {
    // Reset the dismissed state to ensure the banner always shows up
    localStorage.removeItem('donateBannerDismissed');
    setIsVisible(true);
  }, []);
  
  const handleDismiss = () => {
    localStorage.setItem('donateBannerDismissed', Date.now().toString());
    setIsVisible(false);
  };
  
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  if (!isVisible) return null;
  
  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out ${
        isMinimized ? 'w-16 h-16 rounded-full' : 'w-64 rounded-lg'
      } overflow-hidden shadow-lg`}
    >
      {isMinimized ? (
        <button 
          onClick={handleMinimize}
          className="w-full h-full bg-purple-900 flex items-center justify-center hover:bg-purple-800 transition-colors"
        >
          <img 
            src={bannerImage}
            alt="Donate" 
            className="w-12 h-12 object-contain" 
          />
        </button>
      ) : (
        <div className="relative bg-gray-900 border-2 border-yellow-500">
          <button 
            onClick={handleDismiss} 
            className="absolute top-1 right-1 text-gray-300 hover:text-white p-1"
            aria-label="Close donate banner"
          >
            <X size={16} />
          </button>
          
          <div className="p-3">
            <a 
              href="https://libme.xyz/cjgift" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <img 
                src={bannerImage}
                alt="Support Chicken Jockey Development" 
                className="w-full h-auto mb-2 image-rendering-pixelated" 
              />
              <button className="w-full bg-primary hover:brightness-110 text-dark font-bold py-2 rounded text-sm transition-all">
                SUPPORT DEVELOPMENT
              </button>
            </a>
            
            <button 
              onClick={handleMinimize} 
              className="mt-2 text-xs text-gray-400 hover:text-white w-full text-center"
            >
              Minimize
            </button>
          </div>
        </div>
      )}
    </div>
  );
}