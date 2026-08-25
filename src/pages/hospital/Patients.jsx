import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, ChevronRight, BedDouble } from 'lucide-react';
import { usePatientSearch } from '../../hooks/usePatientSearch';
import { formatPatientId, getInitials } from '../../lib/utils';
import { EmptyState } from '../../components/ui/EmptyState';

export function HospitalPatients() {
  const { query, results, loading, search } = usePatientSearch();

  return (
    <div className="dashboard-container">
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Hospital Patient Lookup</h1>
          <p className="page-sub">
            Lookup patient clinical histories before admission or emergency triage.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        <label className="field-label" style={{ marginBottom: 8 }}>
          Find Patient
        </label>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--sp-4)', letterSpacing: '0.04em' }}>
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
                  <th className="table-head">Gender</th>
                  <th className="table-head" style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {results.map((p) => (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-sm avatar-green">
                          {getInitials(p.full_name)}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.full_name}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <strong style={{ color: 'var(--accent)', letterSpacing: '0.04em' }}>
                        {formatPatientId(p.patient_identifier || p.id)}
                      </strong>
                    </td>
                    <td className="table-cell">
                      <div>{p.email}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.phone || 'No phone'}</div>
                    </td>
                    <td className="table-cell" style={{ textTransform: 'capitalize' }}>
                      {p.gender || '—'}
                    </td>
                    <td className="table-cell" style={{ textAlign: 'right' }}>
                      <Link to={`/hospital/patients/${p.id}`} className="btn btn-outline btn-sm">
                        View Record <ChevronRight size={14} />
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
