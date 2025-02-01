import React from 'react';
import { ArrowLeft } from 'lucide-react';

function BackButton() {
  const goBack = () => {
    window.history.back();
  };

  return (
    <button
      onClick={goBack}
      className="fixed top-6 left-6 bg-white/90 backdrop-blur-sm text-purple-600 p-3 rounded-full shadow-lg hover:bg-purple-50 transition-colors flex items-center gap-2 border border-purple-100"
      title="Voltar"
    >
      <ArrowLeft size={24} />
    </button>
  );
}

export default BackButton;