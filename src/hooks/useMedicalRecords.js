import { useState, useEffect, useCallback } from 'react';
import { patientService } from '../services/patientService';

/**
 * Hook for fetching medical history timeline.
 */
export function useMedicalRecords({ type = null, page = 1, perPage = 20, search = '' } = {}) {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await patientService.getMedicalHistory({ page, perPage, type, search });
      setRecords(result.records);
      setTotal(result.total);
    } catch (err) {
      setError(err.message || 'Failed to load medical history');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, type, search]);

  useEffect(() => { fetch(); }, [fetch]);

  return { records, total, loading, error, refresh: fetch };
}

/**
 * Hook for patient prescriptions.
 */
export function usePatientPrescriptions({ page = 1, perPage = 20 } = {}) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await patientService.getPrescriptions({ page, perPage });
      setPrescriptions(result.prescriptions);
      setTotal(result.total);
    } catch (err) {
      setError(err.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => { fetch(); }, [fetch]);
  return { prescriptions, total, loading, error, refresh: fetch };
}

/**
 * Hook for patient diagnostic reports.
 */
export function usePatientReports({ page = 1, perPage = 20 } = {}) {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await patientService.getDiagnosticReports({ page, perPage });
      setReports(result.reports);
      setTotal(result.total);
    } catch (err) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => { fetch(); }, [fetch]);
  return { reports, total, loading, error, refresh: fetch };
}

/**
 * Hook for patient hospital visits.
 */
export function usePatientVisits({ page = 1, perPage = 20 } = {}) {
  const [visits, setVisits] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await patientService.getHospitalVisits({ page, perPage });
      setVisits(result.visits);
      setTotal(result.total);
    } catch (err) {
      setError(err.message || 'Failed to load visits');
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => { fetch(); }, [fetch]);
  return { visits, total, loading, error, refresh: fetch };
}

/**
 * Hook for patient providers.
 */
export function usePatientProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientService.getProviders();
      setProviders(data);
    } catch (err) {
      setError(err.message || 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { providers, loading, error, refresh: fetch };
}

/**
 * Hook for patient dashboard stats.
 */
export function usePatientDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await patientService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { stats, loading, error, refresh: fetch };
}
