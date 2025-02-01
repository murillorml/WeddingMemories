import React, { useState } from 'react';
import { Search } from 'lucide-react';
import BackButton from './BackButton';
import { useWeddings } from '../lib/hooks/useWeddings';

function GuestSelection() {
  const [searchTerm, setSearchTerm] = useState('');
  const { weddings, loading, error } = useWeddings();

  const filteredWeddings = weddings.filter(wedding => (
    wedding.groom_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wedding.bride_name.toLowerCase().includes(searchTerm.toLowerCase())
  ));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-purple-600">Carregando casamentos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Erro ao carregar casamentos: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <BackButton />
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-gray-800 mb-2">Selecione um Casamento</h1>
            <p className="text-gray-600">Escolha o casamento que você deseja compartilhar suas memórias</p>
          </div>

          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome dos noivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredWeddings.map((wedding) => (
              <button
                key={wedding.id}
                onClick={() => window.location.href = `/?wedding=${wedding.id}`}
                className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="relative h-48">
                  <img
                    src={wedding.banner_image}
                    alt={`${wedding.groom_name} e ${wedding.bride_name}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-lg font-medium mb-1">
                      {wedding.groom_name} & {wedding.bride_name}
                    </h3>
                    <p className="text-sm opacity-90">
                      {new Date(wedding.date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm opacity-75">{wedding.location}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuestSelection;