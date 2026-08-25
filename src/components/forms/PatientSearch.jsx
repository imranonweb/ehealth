import { Search, User, X, Check } from 'lucide-react';
import { usePatientSearch } from '../../hooks/usePatientSearch';
import { formatPatientId } from '../../lib/utils';

export function PatientSearch({ onSelectPatient, selectedPatient, onClear }) {
  const {
    query,
    results,
    loading,
    search,
    selectPatient,
    clearSelection,
  } = usePatientSearch();

  const handleChoose = (patient) => {
    selectPatient(patient);
    onSelectPatient?.(patient);
  };

  const handleReset = () => {
    clearSelection();
    onClear?.();
  };

  if (selectedPatient) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'var(--accent-subtle)',
        border: '1.5px solid var(--accent)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="avatar avatar-sm avatar-teal">
            <Check size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              {selectedPatient.full_name}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              ID: <strong>{formatPatientId(selectedPatient.patient_identifier || selectedPatient.id)}</strong> · {selectedPatient.email || selectedPatient.phone}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Change patient"
        >
          <X size={16} /> Change
        </button>
      </div>
    );
  }

  return (
    <div className="patient-search">
      <div className="input-wrap">
        <Search size={16} className="input-icon" />
        <input
          type="text"
          className="input has-icon"
          placeholder="Search patient by name, ID, email or phone..."
          value={query}
          onChange={(e) => search(e.target.value)}
        />
      </div>

      {loading && (
        <div style={{ padding: '8px 12px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Searching patients…
        </div>
      )}

      {results.length > 0 && (
        <div className="patient-search-results">
          {results.map((p) => (
            <div
              key={p.id}
              className="patient-search-item"
              onClick={() => handleChoose(p)}
            >
              <div className="avatar avatar-sm avatar-teal">
                <User size={15} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {p.full_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatPatientId(p.patient_identifier || p.id)} · {p.email} · {p.phone || 'No phone'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
