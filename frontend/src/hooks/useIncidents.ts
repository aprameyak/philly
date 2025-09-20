import { useState, useEffect } from 'react';
import { apiService, Incident } from '../services/api';

export interface UseCrimeReturn {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCrime = (): UseCrimeReturn => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCrime = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching crime data from API...');
      const data = await apiService.getCrime();
      console.log('Crime data fetched successfully:', data.length, 'incidents');
      setIncidents(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch crime data';
      setError(errorMessage);
      console.error('Error fetching crime data:', err);
      console.error('Error details:', {
        message: errorMessage,
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrime();
  }, []);

  return {
    incidents,
    loading,
    error,
    refetch: fetchCrime,
  };
};

// Keep the old hook for backward compatibility
export const useIncidents = useCrime;
