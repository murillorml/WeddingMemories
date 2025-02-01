import React, { useState } from 'react';
import { UserCircle, KeyRound } from 'lucide-react';
import * as api from '../lib/api';

interface GuestRegistrationProps {
  onRegister: (name: string, guestId: string) => void;
  weddingId: string;
  initialPin?: string | null;
}

function GuestRegistration({ onRegister, weddingId, initialPin }: GuestRegistrationProps) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState(initialPin || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pin.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // First verify the PIN
      const pinValid = await api.verifyWeddingPin(weddingId, pin);
      if (!pinValid) {
        setError('PIN inválido. Por favor, verifique o código fornecido pelos noivos.');
        setLoading(false);
        return;
      }

      const guest = await api.createGuest({
        name: name.trim(),
        wedding_id: weddingId
      });
      onRegister(guest.name, guest.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar convidado');
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <UserCircle className="w-16 h-16 mx-auto text-purple-500 mb-4" />
          <h1 className="text-2xl font-serif text-gray-800 mb-2">Bem-vindo(a)!</h1>
          <p className="text-gray-600">Digite seu nome e o PIN do casamento para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seu Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-colors"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PIN do Casamento
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={pin}
                onChange={handlePinChange}
                placeholder="Digite o PIN de 6 dígitos"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-colors tracking-widest font-mono"
                required
                disabled={loading}
                pattern="\d{6}"
                inputMode="numeric"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim() || pin.length !== 6}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-purple-400"
          >
            {loading ? 'Verificando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default GuestRegistration;