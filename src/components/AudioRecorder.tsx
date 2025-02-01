import React, { useState, useRef } from 'react';
import { Mic, Square, Send, X, Play, Pause } from 'lucide-react';
import { useMemories } from '../lib/hooks/useMemories';

interface AudioRecorderProps {
  guestId: string;
  weddingId: string;
}

function AudioRecorder({ guestId, weddingId }: AudioRecorderProps) {
  const { addAudio } = useMemories(weddingId, guestId);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('Não foi possível acessar o microfone. Por favor, verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = async () => {
    if (!audioBlob) return;

    setSending(true);
    try {
      // Calculate duration
      const audio = new Audio(audioUrl!);
      await new Promise((resolve) => {
        audio.addEventListener('loadedmetadata', resolve, { once: true });
      });
      const duration = `${Math.floor(audio.duration)}s`;

      // Create a File object from the Blob
      const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });

      // Upload the file
      await addAudio(file, duration);
      
      handleRemove();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload audio');
    } finally {
      setSending(false);
    }
  };

  const handleRemove = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setError(null);
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px]">
        {!isRecording && !audioBlob ? (
          <button
            onClick={startRecording}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          >
            <Mic className="w-8 h-8 text-white" />
          </button>
        ) : isRecording ? (
          <button
            onClick={stopRecording}
            className="p-4 rounded-full bg-gray-800 hover:bg-gray-900 transition-colors animate-pulse"
          >
            <Square className="w-8 h-8 text-white" />
          </button>
        ) : audioUrl ? (
          <div className="w-full space-y-4">
            <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
            <button
              onClick={togglePlayback}
              className="p-4 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors mx-auto block"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white" />
              )}
            </button>
          </div>
        ) : null}
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {audioBlob && (
        <div className="flex gap-3">
          <button
            onClick={handleRemove}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <X size={20} />
            <span>Remover</span>
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-purple-300 flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <Send className="animate-bounce" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send />
                <span>Enviar Áudio</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default AudioRecorder;