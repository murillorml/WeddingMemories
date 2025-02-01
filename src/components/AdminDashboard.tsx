import React, { useState, useEffect } from 'react';
import { Camera, MessageSquare, Mic, Download, Heart, Link, Share2, QrCode, Edit, Video } from 'lucide-react';
import QRCode from 'qrcode.react';
import confetti from 'canvas-confetti';
import CountdownTimer from './CountdownTimer';
import EditWeddingForm from './EditWeddingForm';
import JSZip from 'jszip';
import * as api from '../lib/api';

interface AdminDashboardProps {
  weddingId?: string | null;
}

interface Wedding {
  id: string;
  groom_name: string;
  bride_name: string;
  date: string;
  location: string;
  banner_image: string;
  description: string | null;
  pin: string;
}

interface Guest {
  id: string;
  name: string;
}

interface Memory {
  id: string;
  url?: string;
  content?: string;
  duration?: string;
  guest?: Guest | null;
  created_at: string;
}

function AdminDashboard({ weddingId }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'audios' | 'messages'>('photos');
  const [showQRModal, setShowQRModal] = useState(false);
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [photos, setPhotos] = useState<Memory[]>([]);
  const [videos, setVideos] = useState<Memory[]>([]);
  const [audios, setAudios] = useState<Memory[]>([]);
  const [messages, setMessages] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  useEffect(() => {
    if (weddingId) {
      fetchWeddingData();
      fetchMemories();
    }
  }, [weddingId]);

  const fetchWeddingData = async () => {
    try {
      const data = await api.getWedding(weddingId!);
      setWedding(data);
    } catch (err) {
      setError('Erro ao carregar dados do casamento');
      console.error('Wedding fetch error:', err);
    }
  };

  const fetchMemories = async () => {
    try {
      setMediaError(null);
      const data = await api.getWeddingMemories(weddingId!);
      
      const verifyUrl = async (url: string) => {
        try {
          const response = await fetch(url, { method: 'HEAD' });
          return response.ok;
        } catch {
          return false;
        }
      };

      const validPhotos = await Promise.all(
        data.photos.map(async (photo) => ({
          ...photo,
          isValid: await verifyUrl(photo.url)
        }))
      );

      const validVideos = await Promise.all(
        data.videos.map(async (video) => ({
          ...video,
          isValid: await verifyUrl(video.url)
        }))
      );

      const validAudios = await Promise.all(
        data.audios.map(async (audio) => ({
          ...audio,
          isValid: await verifyUrl(audio.url)
        }))
      );

      setPhotos(validPhotos.filter(p => p.isValid));
      setVideos(validVideos.filter(v => v.isValid));
      setAudios(validAudios.filter(a => a.isValid));
      setMessages(data.messages);

      const totalInvalid = 
        validPhotos.filter(p => !p.isValid).length +
        validVideos.filter(v => !v.isValid).length +
        validAudios.filter(a => !a.isValid).length;

      if (totalInvalid > 0) {
        setMediaError(`Alguns arquivos de mídia (${totalInvalid}) não puderam ser carregados. Isso pode ocorrer se os arquivos foram removidos do storage.`);
      }
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : 'Erro ao carregar memórias');
      console.error('Memories fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const guestAccessUrl = wedding ? `${window.location.origin}?wedding=${weddingId}&pin=${wedding.pin}` : '';

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Link copiado com sucesso!');
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const getGuestName = (memory: Memory) => {
    return memory.guest?.name || 'Convidado';
  };

  const handleDownloadAll = async () => {
    try {
      setDownloadProgress(0);
      const zip = new JSZip();
      let totalFiles = photos.length + videos.length + audios.length;
      let processedFiles = 0;

      const photosFolder = zip.folder('fotos');
      for (const photo of photos) {
        try {
          const response = await fetch(photo.url!);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const blob = await response.blob();
          const filename = `foto-${getGuestName(photo)}-${new Date(photo.created_at).toISOString()}.${blob.type.split('/')[1]}`;
          photosFolder?.file(filename, blob);
          processedFiles++;
          setDownloadProgress((processedFiles / totalFiles) * 100);
        } catch (err) {
          console.error(`Error downloading photo: ${photo.url}`, err);
        }
      }

      const videosFolder = zip.folder('videos');
      for (const video of videos) {
        try {
          const response = await fetch(video.url!);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const blob = await response.blob();
          const filename = `video-${getGuestName(video)}-${new Date(video.created_at).toISOString()}.${blob.type.split('/')[1]}`;
          videosFolder?.file(filename, blob);
          processedFiles++;
          setDownloadProgress((processedFiles / totalFiles) * 100);
        } catch (err) {
          console.error(`Error downloading video: ${video.url}`, err);
        }
      }

      const audiosFolder = zip.folder('audios');
      for (const audio of audios) {
        try {
          const response = await fetch(audio.url!);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const blob = await response.blob();
          const filename = `audio-${getGuestName(audio)}-${new Date(audio.created_at).toISOString()}.${blob.type.split('/')[1]}`;
          audiosFolder?.file(filename, blob);
          processedFiles++;
          setDownloadProgress((processedFiles / totalFiles) * 100);
        } catch (err) {
          console.error(`Error downloading audio: ${audio.url}`, err);
        }
      }

      const messagesText = messages
        .map(msg => `${getGuestName(msg)} (${new Date(msg.created_at).toLocaleString('pt-BR')}):\n${msg.content}\n\n`)
        .join('---\n\n');
      zip.file('mensagens.txt', messagesText);

      const content = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 5 }
      });
      
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `memorias-casamento-${wedding?.bride_name}-${wedding?.groom_name}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloadProgress(null);
    } catch (err) {
      console.error('Error downloading memories:', err);
      alert('Erro ao baixar as memórias. Por favor, tente novamente.');
      setDownloadProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-purple-600">Carregando...</div>
      </div>
    );
  }

  if (error || !wedding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error || 'Casamento não encontrado'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="relative h-80 rounded-xl overflow-hidden mb-8 shadow-lg">
          <img
            src={wedding?.banner_image}
            alt="Banner do Casamento"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-8 text-white w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Heart className="text-pink-400" />
                  <h1 className="text-4xl font-serif">
                    {wedding?.bride_name} & {wedding?.groom_name}
                  </h1>
                </div>
                <button
                  onClick={() => setShowEditForm(true)}
                  className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
                >
                  <Edit size={20} />
                  <span>Editar</span>
                </button>
              </div>
              <p className="text-lg opacity-90">
                {new Date(wedding?.date || '').toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="opacity-75">{wedding?.location}</p>
            </div>
          </div>
        </div>

        {wedding && new Date(wedding.date) > new Date() && (
          <div className="mb-8">
            <CountdownTimer date={wedding.date} />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Share2 className="text-purple-500" />
            Compartilhar com os Convidados
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-gray-600">Link de acesso para os convidados:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={guestAccessUrl}
                  readOnly
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(guestAccessUrl)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Link className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                PIN de Acesso Convidados: <span className="font-mono font-bold">{wedding?.pin}</span>
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">QR Code para acesso rápido:</p>
              <div className="flex gap-4 items-center">
                <div className="bg-white p-4 rounded-lg shadow-md inline-block">
                  <QRCode value={guestAccessUrl} size={120} level="H" />
                </div>
                <button
                  onClick={() => setShowQRModal(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <QrCode className="w-5 h-5" />
                  <span>Ver QR Code Ampliado</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {mediaError && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {mediaError}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-center mb-6 space-x-4">
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'photos' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Camera className="mr-2" size={20} />
              <span>Fotos ({photos.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'videos' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Video className="mr-2" size={20} />
              <span>Vídeos ({videos.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('audios')}
              className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'audios' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Mic className="mr-2" size={20} />
              <span>Áudios ({audios.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'messages' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="mr-2" size={20} />
              <span>Mensagens ({messages.length})</span>
            </button>
          </div>

          <div className="mt-6">
            {activeTab === 'photos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map((photo) => (
                  <div key={photo.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-md">
                    <img 
                      src={photo.url} 
                      alt={`Foto de ${getGuestName(photo)}`}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400x300?text=Imagem+não+disponível';
                      }}
                    />
                    <div className="p-4">
                      <p className="font-medium text-gray-900">{getGuestName(photo)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(photo.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="space-y-4">
                {videos.map((video) => (
                  <div key={video.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{getGuestName(video)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(video.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <video 
                      controls 
                      className="w-full rounded-lg"
                      src={video.url}
                      onError={(e) => {
                        const target = e.target as HTMLVideoElement;
                        target.style.display = 'none';
                        target.parentElement?.insertAdjacentHTML(
                          'beforeend',
                          '<div class="bg-red-50 text-red-600 p-4 rounded-lg">Vídeo não disponível</div>'
                        );
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'audios' && (
              <div className="space-y-4">
                {audios.map((audio) => (
                  <div key={audio.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{getGuestName(audio)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(audio.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">{audio.duration}</span>
                    </div>
                    <audio 
                      controls 
                      className="w-full mt-2" 
                      src={audio.url}
                      onError={(e) => {
                        const target = e.target as HTMLAudioElement;
                        target.style.display = 'none';
                        target.parentElement?.insertAdjacentHTML(
                          'beforeend',
                          '<div class="bg-red-50 text-red-600 p-4 rounded-lg">Áudio não disponível</div>'
                        );
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-900">{getGuestName(message)}</p>
                      <span className="text-sm text-gray-500">
                        {new Date(message.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <button 
              onClick={handleDownloadAll}
              disabled={downloadProgress !== null}
              className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors relative overflow-hidden"
            >
              {downloadProgress !== null ? (
                <>
                  <div 
                    className="absolute inset-0 bg-purple-800 transition-all" 
                    style={{ width: `${downloadProgress}%` }}
                  />
                  <span className="relative z-10">Baixando... {Math.round(downloadProgress)}%</span>
                </>
              ) : (
                <>
                  <Download className="mr-2" size={20} />
                  <span>Baixar Todas as Memórias</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-medium text-gray-800 mb-6 text-center">QR Code do Casamento</h3>
            <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center mb-6">
              <QRCode value={guestAccessUrl} size={250} level="H" />
              <p className="mt-4 text-lg font-mono font-bold text-gray-800">PIN: {wedding?.pin || 'N/A'}</p>
            </div>
            <p className="text-gray-600 text-center mb-6">
              Compartilhe este QR Code com seus convidados para que eles possam enviar suas memórias facilmente.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Imprimir QR Code
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditForm && wedding && (
        <EditWeddingForm
          wedding={wedding}
          onClose={() => setShowEditForm(false)}
          onUpdate={() => {
            fetchWeddingData();
            setShowEditForm(false);
          }}
        />
      )}
    </div>
  );
}

export default AdminDashboard;