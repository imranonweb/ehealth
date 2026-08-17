import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, ChevronRight, Upload } from 'lucide-react';
import { usePatientSearch } from '../../hooks/usePatientSearch';
import { formatPatientId, getInitials } from '../../lib/utils';
import { EmptyState } from '../../components/ui/EmptyState';

export function DiagnosticsPatients() {
  const { query, results, loading, search } = usePatientSearch();

  return (
    <div className="dashboard-container">
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Patient Directory & Test Linking</h1>
          <p className="page-sub">
            Lookup patients by unique Health ID or phone number before uploading investigation reports.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        <label className="field-label" style={{ marginBottom: 8 }}>
          Find Patient
        </label>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            type="text"
            className="input has-icon"
            placeholder="Type patient name, health ID (e.g. P-12345678), email, or phone number..."
            value={query}
            onChange={(e) => search(e.target.value)}
            style={{ fontSize: '1rem', height: 46 }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 'var(--sp-4)', letterSpacing: '0.04em' }}>
          {loading ? 'Searching Registry…' : results.length > 0 ? `Matched Patients (${results.length})` : 'Search Results'}
        </div>

        {results.length === 0 && !loading && (
          <EmptyState
            icon={Users}
            title={query.length >= 2 ? "No Patients Found" : "Type to Search Patients"}
            description={query.length >= 2 ? "No registered patient matched your search query." : "Search by name, ID, or phone to find patient."}
          />
        )}

        {results.length > 0 && (
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Patient Name</th>
                  <th className="table-head">Health ID</th>
                  <th className="table-head">Contact</th>
                  <th className="table-head" style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {results.map((p) => (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-sm avatar-purple">
                          {getInitials(p.full_name)}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{p.full_name}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <strong style={{ color: 'var(--primary)', letterSpacing: '0.04em' }}>
                        {formatPatientId(p.patient_identifier || p.id)}
                      </strong>
                    </td>
                    <td className="table-cell">
                      <div>{p.email}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{p.phone || 'No phone'}</div>
                    </td>
                    <td className="table-cell" style={{ textAlign: 'right' }}>
                      <Link to="/diagnostics/reports/new" className="btn btn-outline btn-sm">
                        <Upload size={13} /> Upload Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
