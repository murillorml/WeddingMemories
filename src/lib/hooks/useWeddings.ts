import { useEffect, useState } from 'react';
import type { Database } from '../database.types';
import * as api from '../api';

type Wedding = Database['public']['Tables']['weddings']['Row'];

export function useWeddings() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeddings();
  }, []);

  async function fetchWeddings() {
    try {
      setLoading(true);
      const data = await api.getWeddings();
      setWeddings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching weddings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function createWedding(weddingData: Omit<Wedding, 'id' | 'created_at'>) {
    try {
      const data = await api.createWedding(weddingData);
      setWeddings(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating wedding:', err);
      throw err instanceof Error ? err : new Error('Failed to create wedding');
    }
  }

  return { weddings, loading, error, createWedding, refetch: fetchWeddings };
}