import React, { useState } from 'react';
import { Heart, QrCode, Calendar, Users, Lock, Mail } from 'lucide-react';
import QRCode from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useWeddings } from '../lib/hooks/useWeddings';

interface WeddingDetails {
  groom_name: string;
  bride_name: string;
  date: string;
  location: string;
  banner_image: string;
  description: string;
  password: string;
  email: string;
}

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function CreateWedding() {
  const { createWedding } = useWeddings();
  const [weddingDetails, setWeddingDetails] = useState<WeddingDetails>({
    groom_name: '',
    bride_name: '',
    date: '',
    location: '',
    banner_image: '',
    description: '',
    password: '',
    email: ''
  });
  const [showQR, setShowQR] = useState(false);
  const [weddingId, setWeddingId] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const generatedPin = generatePin();
      setPin(generatedPin);
      
      const wedding = await createWedding({
        ...weddingDetails,
        pin: generatedPin
      });
      setWeddingId(wedding.id);
      
      // Delay to allow animation to complete
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setShowQR(true);
      }, 500);
    } catch (err: any) {
      // Handle specific error cases
      if (err.message.includes('weddings_email_unique')) {
        setError('Este email já está cadastrado. Por favor, use outro email.');
      } else if (err.message.includes('weddings_email_check')) {
        setError('Por favor, insira um email válido.');
      } else if (err.message.includes('weddings_groom_name_check')) {
        setError('O nome do noivo não pode estar vazio.');
      } else if (err.message.includes('weddings_bride_name_check')) {
        setError('O nome da noiva não pode estar vazio.');
      } else {
        setError('Ocorreu um erro ao criar o casamento. Por favor, tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWeddingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const getQRValue = () => {
    return `${window.location.origin}/?wedding=${weddingId}&pin=${pin}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Heart className="w-16 h-16 mx-auto text-purple-500 mb-4 heart-animation" />
            <h1 className="text-3xl font-serif text-gray-800 mb-2">Criar Novo Casamento</h1>
            <p className="text-gray-600">Preencha os detalhes do casamento para começar a receber memórias</p>
          </div>

          {!showQR ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Noiva</label>
                  <input
                    type="text"
                    name="bride_name"
                    value={weddingDetails.bride_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Noivo</label>
                  <input
                    type="text"
                    name="groom_name"
                    value={weddingDetails.groom_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data do Casamento</label>
                  <input
                    type="date"
                    name="date"
                    value={weddingDetails.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Local do Casamento</label>
                  <input
                    type="text"
                    name="location"
                    value={weddingDetails.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL da Foto do Banner</label>
                <input
                  type="url"
                  name="banner_image"
                  value={weddingDetails.banner_image}
                  onChange={handleChange}
                  placeholder="https://exemplo.com/foto-banner.jpg"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea
                  name="description"
                  value={weddingDetails.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-colors h-32"
                  placeholder="Uma breve descrição sobre o casamento..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline-block w-4 h-4 mr-1" />
                  Email para Recuperação
                </label>
                <input
                  type="email"
                  name="email"
                  value={weddingDetails.email}
                  onChange={handleChange}
                  placeholder="email@exemplo.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-colors"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Este email será usado para recuperar a senha caso necessário
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="inline-block w-4 h-4 mr-1" />
                  Senha de Acesso ao Painel
                </label>
                <input
                  type="password"
                  name="password"
                  value={weddingDetails.password}
                  onChange={handleChange}
                  placeholder="Digite uma senha segura"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-colors"
                  required
                  minLength={6}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Esta senha será usada para acessar o painel administrativo do casamento
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 text-white py-4 rounded-lg hover:bg-purple-700 transition-all button-hover-effect font-medium flex items-center justify-center gap-2 disabled:bg-purple-400"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Criando...</span>
                  </>
                ) : (
                  <>
                    <QrCode />
                    <span>Gerar QR Code</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="mb-8">
                <div className="bg-purple-50 p-8 rounded-lg inline-block">
                  <QRCode
                    value={getQRValue()}
                    size={200}
                    level="H"
                  />
                </div>
              </div>
              <h2 className="text-xl font-medium text-gray-800 mb-4">QR Code Gerado com Sucesso!</h2>
              <p className="text-gray-600 mb-6">
                Compartilhe este QR Code com seus convidados para que eles possam enviar suas memórias.
              </p>
              <div className="space-y-4">
                <p className="text-sm bg-yellow-50 p-4 rounded-lg text-yellow-800">
                  <strong>Importante:</strong> Guarde sua senha de acesso e email! Você precisará deles para acessar o painel administrativo.
                </p>
                <button
                  onClick={() => {
                    triggerConfetti();
                    setTimeout(() => {
                      window.print();
                    }, 500);
                  }}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all button-hover-effect font-medium inline-flex items-center gap-2"
                >
                  <span>Imprimir QR Code</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateWedding;