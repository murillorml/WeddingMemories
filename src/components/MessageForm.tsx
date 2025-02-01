import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useMemories } from '../lib/hooks/useMemories';

interface MessageFormProps {
  guestName: string;
  guestId: string;
  weddingId: string;
}

function MessageForm({ guestId, weddingId }: MessageFormProps) {
  const { addMessage } = useMemories(weddingId, guestId);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      await addMessage(message.trim());
      setMessage('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Escreva sua mensagem para os noivos..."
        className="w-full h-40 px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-colors resize-none"
        required
      />
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      <button
        type="submit"
        disabled={sending || !message.trim()}
        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-purple-300 flex items-center justify-center gap-2"
      >
        {sending ? (
          <>
            <Send className="animate-bounce" />
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <Send />
            <span>Enviar Mensagem</span>
          </>
        )}
      </button>
    </form>
  );
}

export default MessageForm