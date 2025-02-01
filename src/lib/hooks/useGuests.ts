import { useEffect, useState } from 'react';
import type { Database } from '../database.types';
import * as api from '../api';

type Guest = Database['public']['Tables']['guests']['Row'];

export function useGuests(weddingId: string) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (weddingId) {
      fetchGuests();
    }
  }, [weddingId]);

  async function fetchGuests() {
    try {
      const data = await api.getWeddingGuests(weddingId);
      setGuests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function createGuest(name: string) {
    try {
      const data = await api.createGuest({ name, wedding_id: weddingId });
      setGuests(prev => [data, ...prev]);
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create guest');
    }
  }

  return { guests, loading, error, createGuest };
}