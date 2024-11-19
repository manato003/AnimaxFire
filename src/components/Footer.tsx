import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black/30 backdrop-blur-sm py-8">
      <div className="container mx-auto px-4 text-center text-gray-400">
        <div className="flex justify-center mb-4">
          <img 
            src="/animax-logo.svg" 
            alt="ANIMAX" 
            className="h-8 w-auto"
            style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' }}
          />
        </div>
        <p>Copyright © 2024 Artemis Animax Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};