import { Database } from './database.types';

type Wedding = Database['public']['Tables']['weddings']['Row'];
type Guest = Database['public']['Tables']['guests']['Row'];
type Photo = Database['public']['Tables']['photos']['Row'];
type Video = Database['public']['Tables']['videos']['Row'];
type Audio = Database['public']['Tables']['audios']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];

const API_URL = 'https://wedding-memories-api.onrender.com';

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    console.log(`[API Debug] Making request to: ${endpoint}`, options);
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new APIError(response.status, errorData.detail || 'API request failed');
    }

    const data = await response.json();
    console.log(`[API Debug] Response from ${endpoint}:`, data);
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(500, error instanceof Error ? error.message : 'Network error');
  }
}

export async function getWeddings(): Promise<Wedding[]> {
  const weddings = await fetchApi<Wedding[]>('/weddings/');
  return weddings.map(wedding => ({
    ...wedding,
    pin: wedding.pin?.trim().padStart(6, '0') || '000000'
  }));
}

export async function getWedding(id: string): Promise<Wedding> {
  try {
    console.log(`[PIN Debug] Fetching wedding with ID: ${id}`);
    const wedding = await fetchApi<Wedding>(`/weddings/${id}`);
    if (!wedding) {
      throw new APIError(404, 'Wedding not found');
    }
    
    console.log('[PIN Debug] Raw wedding data:', wedding);
    
    // Ensure the wedding object has all required fields
    const processedWedding = {
      ...wedding,
      // Ensure PIN is always a 6-digit string
      pin: (wedding.pin || '000000').toString().trim().padStart(6, '0')
    };
    
    console.log('[PIN Debug] Processed wedding data:', processedWedding);
    return processedWedding;
  } catch (error) {
    console.error('[PIN Debug] Error in getWedding:', error);
    throw error;
  }
}

export async function createWedding(wedding: Omit<Wedding, 'id' | 'created_at'>): Promise<Wedding> {
  console.log('[PIN Debug] Creating wedding with data:', wedding);
  
  // Ensure PIN is provided and properly formatted
  if (!wedding.pin) {
    throw new APIError(400, 'PIN is required');
  }
  
  const formattedWedding = {
    ...wedding,
    pin: wedding.pin.toString().trim().padStart(6, '0')
  };
  
  console.log('[PIN Debug] Formatted wedding data:', formattedWedding);
  
  return fetchApi<Wedding>('/weddings/', {
    method: 'POST',
    body: JSON.stringify(formattedWedding),
  });
}

export async function updateWedding(id: string, wedding: Partial<Wedding>): Promise<Wedding> {
  console.log('[PIN Debug] Updating wedding. Original data:', wedding);
  
  const updateData = { ...wedding };
  
  // If PIN is being updated, ensure it's properly formatted
  if (updateData.pin !== undefined) {
    if (!updateData.pin) {
      throw new APIError(400, 'PIN cannot be empty');
    }
    updateData.pin = updateData.pin.toString().trim().padStart(6, '0');
    console.log('[PIN Debug] Formatted PIN in update:', updateData.pin);
  }
  
  return fetchApi<Wedding>(`/weddings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}

export async function verifyWeddingPassword(id: string, password: string): Promise<boolean> {
  try {
    const response = await fetchApi<{ valid: boolean }>('/weddings/verify-password/', {
      method: 'POST',
      body: JSON.stringify({ wedding_id: id, password: password.trim() }),
    });
    return response.valid;
  } catch (error) {
    console.error('Password verification error:', error);
    throw error;
  }
}

export async function verifyWeddingPin(id: string, pin: string): Promise<boolean> {
  try {
    console.log('[PIN Debug] Verifying PIN. Original:', pin);
    const formattedPin = pin.toString().trim().padStart(6, '0');
    console.log('[PIN Debug] Formatted PIN for verification:', formattedPin);
    
    const response = await fetchApi<{ valid: boolean }>('/weddings/verify-pin/', {
      method: 'POST',
      body: JSON.stringify({ wedding_id: id, pin: formattedPin }),
    });
    console.log('[PIN Debug] PIN verification response:', response);
    return response.valid;
  } catch (error) {
    console.error('[PIN Debug] PIN verification error:', error);
    throw error;
  }
}

export async function createGuest(guest: { name: string; wedding_id: string }): Promise<Guest> {
  return fetchApi<Guest>('/guests/', {
    method: 'POST',
    body: JSON.stringify(guest),
  });
}

export async function getWeddingGuests(weddingId: string): Promise<Guest[]> {
  return fetchApi<Guest[]>(`/weddings/${weddingId}/guests/`);
}

export async function getWeddingMemories(weddingId: string): Promise<{
  photos: Photo[];
  videos: Video[];
  audios: Audio[];
  messages: Message[];
}> {
  return fetchApi<{
    photos: Photo[];
    videos: Video[];
    audios: Audio[];
    messages: Message[];
  }>(`/weddings/${weddingId}/memories/`);
}

export async function uploadPhoto(file: File, guestId: string, weddingId: string): Promise<Photo> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('guest_id', guestId);
  formData.append('wedding_id', weddingId);

  const response = await fetch(`${API_URL}/memories/photos/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to upload photo' }));
    throw new APIError(response.status, errorData.detail);
  }

  return response.json();
}

export async function uploadVideo(file: File, guestId: string, weddingId: string): Promise<Video> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('guest_id', guestId);
  formData.append('wedding_id', weddingId);

  const response = await fetch(`${API_URL}/memories/videos/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to upload video' }));
    throw new APIError(response.status, errorData.detail);
  }

  return response.json();
}

export async function uploadAudio(file: File, duration: string, guestId: string, weddingId: string): Promise<Audio> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('duration', duration);
  formData.append('guest_id', guestId);
  formData.append('wedding_id', weddingId);

  const response = await fetch(`${API_URL}/memories/audios/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to upload audio' }));
    throw new APIError(response.status, errorData.detail);
  }

  return response.json();
}

export async function createMessage(message: { content: string; guest_id: string; wedding_id: string }): Promise<Message> {
  return fetchApi<Message>('/memories/messages/', {
    method: 'POST',
    body: JSON.stringify(message),
  });
}

export function generateShareableUrl(weddingId: string, pin: string): string {
  if (!weddingId || !pin) {
    console.warn('[PIN Debug] Missing weddingId or pin for shareable URL generation');
    return '';
  }
  const formattedPin = pin.toString().trim().padStart(6, '0');
   console.log('[PIN Debug] Generated shareable URL with PIN:', formattedPin);
  const baseUrl = window.location.origin;
  return `${baseUrl}/?wedding=${weddingId}&pin=${formattedPin}`;
}