import React, { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import * as api from '../lib/api';

interface AdminLoginProps {
  onLogin: () => void;
  weddingId?: string | null;
}

function AdminLogin({ onLogin, weddingId }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingId) return;

    setLoading(true);
    setError('');

    try {
      const isValid = await api.verifyWeddingPassword(weddingId, password.trim());
      
      if (isValid) {
        onLogin();
      } else {
        setError('Senha incorreta');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Erro ao verificar a senha. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const wedding = await api.getWedding(weddingId!);

      if (wedding.email === email) {
        // Here you would typically send a password reset email
        // For now, we'll just show a success message
        setResetSuccess(true);
      } else {
        setError('Email não encontrado');
      }
    } catch (err) {
      setError('Erro ao processar a solicitação. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!weddingId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
          <Lock className="w-16 h-16 mx-auto text-purple-500 mb-4" />
          <h1 className="text-2xl font-serif text-gray-800 mb-4">Nenhum Casamento Selecionado</h1>
          <p className="text-gray-600 mb-6">
            Por favor, selecione um casamento da lista para acessar o painel administrativo.
          </p>
          <button
            onClick={() => window.location.href = '/weddings'}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Ver Lista de Casamentos
          </button>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
          <Mail className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h1 className="text-2xl font-serif text-gray-800 mb-4">Email Enviado!</h1>
          <p className="text-gray-600 mb-6">
            Enviamos um email com instruções para redefinir sua senha.
            Por favor, verifique sua caixa de entrada.
          </p>
          <button
            onClick={() => setIsResetMode(false)}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Lock className="w-16 h-16 mx-auto text-purple-500 mb-4" />
          <h1 className="text-2xl font-serif text-gray-800 mb-2">Área dos Noivos</h1>
          <p className="text-gray-600">
            {isResetMode 
              ? 'Digite seu email para redefinir a senha'
              : 'Digite a senha para acessar as memórias'}
          </p>
        </div>

        <form onSubmit={isResetMode ? handleResetPassword : handleSubmit}>
          <div className="mb-6">
            {isResetMode ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-colors"
                required
                disabled={loading}
              />
            ) : (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-colors"
                required
                disabled={loading}
              />
            )}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-purple-400 mb-4"
          >
            {loading ? 'Processando...' : (isResetMode ? 'Enviar Email' : 'Entrar')}
          </button>
          <button
            type="button"
            onClick={() => setIsResetMode(!isResetMode)}
            className="w-full text-purple-600 text-sm hover:text-purple-700 transition-colors"
          >
            {isResetMode ? 'Voltar para Login' : 'Esqueceu a senha?'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;