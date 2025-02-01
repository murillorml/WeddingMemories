// This file is no longer needed since we're using the FastAPI backend
export const supabase = {
    from: () => {
      throw new Error('Supabase is not used in this project. Use the API module instead.');
    }
  };