import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, ChevronRight, Upload } from 'lucide-react';
import { usePatientSearch } from '../../hooks/usePatientSearch';
import { formatPatientId, getInitials, stringToColor } from '../../lib/utils';
import { EmptyState } from '../../components/ui/EmptyState';

export function DiagnosticsPatients() {
  const { query, results, loading, search } = usePatientSearch();

  return (
    <div className="dashboard-container">
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="h2" style={{ margin: 0 }}>Patient Directory &amp; Test Linking</h1>
          <p className="body-sm text-muted" style={{ margin: '4px 0 0 0' }}>
            Lookup patients by unique Health ID or phone number before uploading official laboratory test reports.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)', boxShadow: 'var(--shadow-sm)' }}>
        <label className="field-label" style={{ marginBottom: 8, display: 'block', fontWeight: 600 }}>
          Search Patient Registry
        </label>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input has-icon"
            placeholder="Type patient name, health ID (e.g. P-12345678), email, or phone number..."
            value={query}
            onChange={(e) => search(e.target.value)}
            style={{ fontSize: '0.9375rem', height: 46 }}
          />
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-default)' }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {loading ? 'Searching Registry…' : results.length > 0 ? `Matched Patients (${results.length})` : 'Search Results'}
          </div>
        </div>

        {results.length === 0 && !loading && (
          <div style={{ padding: 'var(--sp-10) var(--sp-6)' }}>
            <EmptyState
              icon={Users}
              title={query.length >= 2 ? "No Patients Found" : "Type to Search Patients"}
              description={query.length >= 2 ? "No registered patient matched your search query." : "Search by name, ID, or phone to find patient."}
            />
          </div>
        )}

        {results.length > 0 && (
          <div className="table-container card-table-wrap">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead className="table-header">
                <tr>
                  <th className="table-head" style={{ padding: '14px 24px' }}>Patient</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Health ID</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Contact</th>
                  <th className="table-head" style={{ textAlign: 'right', padding: '14px 24px' }}>Action</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {results.map((p) => {
                  const initials = getInitials(p.full_name);
                  return (
                    <tr key={p.id} className="table-row" style={{ transition: 'background-color 0.15s ease' }}>
                      <td className="table-cell" style={{ padding: '18px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: stringToColor(p.full_name),
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            flexShrink: 0,
                          }}>
                            {initials}
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem', display: 'block' }}>
                              {p.full_name}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {p.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: 'var(--accent)',
                          backgroundColor: 'var(--bg-surface-muted)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-default)',
                        }}>
                          {formatPatientId(p.patient_identifier || p.id)}
                        </span>
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{p.phone || 'No phone recorded'}</div>
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right', padding: '18px 24px' }}>
                        <Link to="/diagnostics/reports/new" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                          <Upload size={14} /> Upload Report
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
