import { useEffect, useState } from 'react';
import type { Database } from '../database.types';
import * as api from '../api';

type Photo = Database['public']['Tables']['photos']['Row'];
type Audio = Database['public']['Tables']['audios']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];
type Video = Database['public']['Tables']['videos']['Row'];

export function useMemories(weddingId: string, guestId: string) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [audios, setAudios] = useState<Audio[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (weddingId && guestId) {
      fetchMemories();
    }
  }, [weddingId, guestId]);

  async function fetchMemories() {
    try {
      const data = await api.getWeddingMemories(weddingId);
      setPhotos(data.photos);
      setAudios(data.audios);
      setMessages(data.messages);
      setVideos(data.videos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function addPhoto(file: File) {
    try {
      const data = await api.uploadPhoto(file, guestId, weddingId);
      setPhotos(prev => [data, ...prev]);
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add photo');
    }
  }

  async function addVideo(file: File) {
    try {
      const data = await api.uploadVideo(file, guestId, weddingId);
      setVideos(prev => [data, ...prev]);
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add video');
    }
  }

  async function addAudio(file: File, duration: string) {
    try {
      const data = await api.uploadAudio(file, duration, guestId, weddingId);
      setAudios(prev => [data, ...prev]);
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add audio');
    }
  }

  async function addMessage(content: string) {
    try {
      const data = await api.createMessage({ content, wedding_id: weddingId, guest_id: guestId });
      setMessages(prev => [data, ...prev]);
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add message');
    }
  }

  return {
    photos,
    audios,
    messages,
    videos,
    loading,
    error,
    addPhoto,
    addAudio,
    addMessage,
    addVideo
  };
}