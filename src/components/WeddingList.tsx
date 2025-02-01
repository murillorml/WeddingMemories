import React, { useState } from 'react';
import { Search, Calendar, Users2, Plus } from 'lucide-react';
import { useWeddings } from '../lib/hooks/useWeddings';

function WeddingList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const { weddings, loading, error } = useWeddings();

  const filteredWeddings = weddings.filter(wedding => {
    const matchesSearch = (
      wedding.groom_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wedding.bride_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesDate = !dateFilter || wedding.date === dateFilter;
    return matchesSearch && matchesDate;
  });

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
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Users2 className="w-16 h-16 mx-auto text-purple-500 mb-4" />
            <h1 className="text-3xl font-serif text-gray-800 mb-2">Casamentos</h1>
            <p className="text-gray-600">Encontre e gerencie todos os casamentos</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
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
            <div className="md:w-64">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-colors"
                />
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/create'}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={20} />
              <span>Criar Casamento</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWeddings.map((wedding) => (
              <div key={wedding.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img
                    src={wedding.banner_image}
                    alt={`${wedding.groom_name} e ${wedding.bride_name}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    {wedding.groom_name} & {wedding.bride_name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    <Calendar className="inline-block w-4 h-4 mr-1" />
                    {new Date(wedding.date).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">{wedding.location}</p>
                  <button
                    onClick={() => window.location.href = `/admin?wedding=${wedding.id}`}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    Acessar Painel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeddingList;