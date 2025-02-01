import React, { useState, useRef, useEffect } from 'react';
import { Crown, Plus, List } from 'lucide-react';

function AdminButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed bottom-6 right-6" ref={dropdownRef}>
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg overflow-hidden w-64 border border-purple-100">
          <button
            onClick={() => window.location.href = '/weddings'}
            className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-center gap-2 text-gray-700"
          >
            <List size={20} className="text-purple-500" />
            <span>Selecionar Casamento</span>
          </button>
          <button
            onClick={() => window.location.href = '/create'}
            className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-center gap-2 text-gray-700 border-t border-purple-100"
          >
            <Plus size={20} className="text-purple-500" />
            <span>Criar Novo Casamento</span>
          </button>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-white/90 backdrop-blur-sm text-purple-600 p-3 rounded-full shadow-lg hover:bg-purple-50 transition-colors flex items-center gap-2 border border-purple-100 ${
          isOpen ? 'bg-purple-50' : ''
        }`}
        title="Área dos Noivos"
      >
        <Crown size={24} />
      </button>
    </div>
  );
}

export default AdminButton;