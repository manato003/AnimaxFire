import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    checkMobile();
    window.addEventListener('scroll', toggleVisibility);
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isMobile) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed right-4 bottom-4 p-3 bg-purple-600 text-white rounded-full shadow-lg transition-opacity duration-300 z-50 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  );
};