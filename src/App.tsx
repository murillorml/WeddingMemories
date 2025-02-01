import React, { useState, useEffect } from 'react';
import { Camera, MessageSquare, Mic } from 'lucide-react';
import GuestRegistration from './components/GuestRegistration';
import MediaUpload from './components/MediaUpload';
import MessageForm from './components/MessageForm';
import AudioRecorder from './components/AudioRecorder';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import CreateWedding from './components/CreateWedding';
import WeddingList from './components/WeddingList';
import BackButton from './components/BackButton';
import WelcomeScreen from './components/WelcomeScreen';
import GuestSelection from './components/GuestSelection';
import * as api from './lib/api';

function App() {
  const [guestName, setGuestName] = useState<string>('');
  const [guestId, setGuestId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'photo' | 'audio' | 'message'>('photo');
  const [isAdmin, setIsAdmin] = useState(false);
  const [weddingDetails, setWeddingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current route
  const currentPath = window.location.pathname;
  const isAdminRoute = currentPath === '/admin';
  const isCreateRoute = currentPath === '/create';
  const isWeddingsRoute = currentPath === '/weddings';
  const isGuestRoute = currentPath === '/guest';
  const isHomePage = currentPath === '/';

  // Get wedding ID and PIN from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const weddingId = urlParams.get('wedding');
  const pin = urlParams.get('pin');

  useEffect(() => {
    if (weddingId) {
      fetchWeddingDetails();
    } else {
      setLoading(false);
    }
  }, [weddingId]);

  const fetchWeddingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getWedding(weddingId!);
      setWeddingDetails(data);
    } catch (err) {
      console.error('Error fetching wedding details:', err);
      setError('Casamento não encontrado. Por favor, verifique o link e tente novamente.');
      setWeddingDetails(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-purple-600">Carregando...</div>
      </div>
    );
  }

  // Show welcome screen if no route is specified
  if (isHomePage && !weddingId) {
    return <WelcomeScreen />;
  }

  // Show guest selection screen
  if (isGuestRoute) {
    return <GuestSelection />;
  }

  if (isCreateRoute) {
    return (
      <>
        <BackButton />
        <CreateWedding />
      </>
    );
  }

  if (isWeddingsRoute) {
    return (
      <>
        <BackButton />
        <WeddingList />
      </>
    );
  }

  if (isAdminRoute) {
    if (!isAdmin) {
      return (
        <>
          <BackButton />
          <AdminLogin onLogin={() => setIsAdmin(true)} weddingId={weddingId} />
        </>
      );
    }
    return (
      <>
        <BackButton />
        <AdminDashboard weddingId={weddingId} />
      </>
    );
  }

  // Show error state if wedding not found
  if (error || !weddingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">Erro</h2>
          <p className="text-gray-600 mb-6">{error || 'Casamento não encontrado'}</p>
          <button
            onClick={() => window.location.href = '/guest'}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Voltar para Seleção
          </button>
        </div>
      </div>
    );
  }

  if (!guestName && weddingId) {
    return (
      <>
        <BackButton />
        <GuestRegistration 
          onRegister={(name, id) => {
            setGuestName(name);
            setGuestId(id);
          }} 
          weddingId={weddingId}
          initialPin={pin}
        />
      </>
    );
  }

  if (!weddingId) {
    window.location.href = '/guest';
    return null;
  }

  return (
    <>
      <BackButton />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-4xl mx-auto p-6">
          {/* Wedding Banner */}
          <div className="relative h-64 rounded-xl overflow-hidden mb-8 shadow-lg">
            <img
              src={weddingDetails.banner_image}
              alt="Banner do Casamento"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-6 text-white w-full">
                <h1 className="text-3xl font-serif mb-2">
                  {weddingDetails.groom_name} & {weddingDetails.bride_name}
                </h1>
                <p className="text-lg opacity-90">
                  {new Date(weddingDetails.date).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="opacity-75">{weddingDetails.location}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <header className="text-center mb-8">
              <h2 className="text-2xl font-serif text-gray-800 mb-2">Memórias do Casamento</h2>
              <p className="text-gray-600">Olá, {guestName}! Compartilhe suas mensagens com os noivos.</p>
            </header>

            <div className="flex justify-around mb-6">
              <button
                onClick={() => setActiveTab('photo')}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                  activeTab === 'photo' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Camera size={24} />
                <span className="text-sm mt-1">Foto</span>
              </button>
              <button
                onClick={() => setActiveTab('audio')}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                  activeTab === 'audio' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Mic size={24} />
                <span className="text-sm mt-1">Áudio</span>
              </button>
              <button
                onClick={() => setActiveTab('message')}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                  activeTab === 'message' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <MessageSquare size={24} />
                <span className="text-sm mt-1">Mensagem</span>
              </button>
            </div>

            <div className="mt-6">
              {activeTab === 'photo' && <MediaUpload guestId={guestId} weddingId={weddingId} />}
              {activeTab === 'audio' && <AudioRecorder guestId={guestId} weddingId={weddingId} />}
              {activeTab === 'message' && <MessageForm guestName={guestName} guestId={guestId} weddingId={weddingId} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;