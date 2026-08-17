import { useState, useCallback, useRef, useEffect } from 'react';
import { searchService } from '../services/searchService';
import { debounce } from '../lib/utils';

/**
 * Hook for patient search with debouncing.
 */
export function usePatientSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const debouncedSearch = useRef(
    debounce(async (q) => {
      if (!q || q.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await searchService.searchPatients(q);
        setResults(data);
      } catch (err) {
        setError(err.message || 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350)
  ).current;

  const search = useCallback((q) => {
    setQuery(q);
    debouncedSearch(q);
  }, [debouncedSearch]);

  const selectPatient = useCallback((patient) => {
    setSelectedPatient(patient);
    setQuery(patient.full_name);
    setResults([]);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPatient(null);
    setQuery('');
    setResults([]);
  }, []);

  return {
    query,
    results,
    loading,
    error,
    selectedPatient,
    search,
    selectPatient,
    clearSelection,
  };
}
