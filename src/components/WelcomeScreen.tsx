import React, { useState, useEffect } from 'react';
import { Users, Crown, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

function WelcomeScreen() {
  const [showContent, setShowContent] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    // Show the content after the animation sequence
    const timer = setTimeout(() => {
      setShowAnimation(false);
      setShowContent(true);
      // Trigger confetti when showing the content
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7C3AED', '#C084FC', '#E879F9']
      });
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#7C3AED', '#C084FC', '#E879F9']
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-6 overflow-hidden">
      {showAnimation ? (
        <div className="text-center">
          <div className="relative">
            <div className="rings-container flex items-center justify-center gap-8">
              <div className="ring-left w-16 h-16 border-4 border-purple-600 rounded-full" />
              <div className="ring-right w-16 h-16 border-4 border-purple-600 rounded-full" />
            </div>
            <Heart 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-purple-600 heart-entrance heart-beat" 
            />
          </div>
        </div>
      ) : (
        <div className="max-w-lg w-full content-fade-in">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif text-gray-800 mb-4">Memórias do Casamento</h1>
            <p className="text-gray-600">Escolha como deseja acessar o sistema</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => {
                triggerConfetti();
                window.location.href = '/guest';
              }}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all button-hover-effect group"
            >
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                  <Users className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="text-xl font-medium text-gray-800 mb-2">Convidado</h2>
                <p className="text-gray-600 text-sm text-center">
                  Compartilhe suas memórias em um casamento específico
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                triggerConfetti();
                window.location.href = '/weddings';
              }}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all button-hover-effect group"
            >
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                  <Crown className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="text-xl font-medium text-gray-800 mb-2">Noivos</h2>
                <p className="text-gray-600 text-sm text-center">
                  Gerencie seu casamento ou crie um novo
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WelcomeScreen;