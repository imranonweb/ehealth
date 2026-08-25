import { Plus, Trash2, Pill } from 'lucide-react';

export function MedicationRows({ medications, onChange }) {
  const addRow = () => {
    onChange([
      ...medications,
      { name: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: '' }
    ]);
  };

  const removeRow = (index) => {
    onChange(medications.filter((_, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    const next = medications.map((m, i) => (i === index ? { ...m, [field]: value } : m));
    onChange(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label className="field-label" style={{ margin: 0 }}>
          Prescribed Medications ({medications.length})
        </label>
        <button type="button" className="btn btn-outline btn-sm" onClick={addRow}>
          <Plus size={14} /> Add Medicine
        </button>
      </div>

      {medications.length === 0 ? (
        <div style={{
          padding: '24px',
          border: '1.5px dashed var(--border-default)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          background: 'var(--bg-surface-muted)',
        }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 10px' }}>
            No medicines added to this prescription yet.
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={addRow}>
            <Plus size={14} /> Add First Medicine
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {medications.map((med, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface-muted)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Medicine #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-danger)', padding: '4px 8px' }}
                  title="Remove medicine"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: 10 }}>
                <div>
                  <input
                    className="input"
                    type="text"
                    placeholder="Medicine Name (e.g. Paracetamol)"
                    value={med.name}
                    onChange={(e) => updateRow(idx, 'name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    className="input"
                    type="text"
                    placeholder="Dosage (e.g. 500mg)"
                    value={med.dosage}
                    onChange={(e) => updateRow(idx, 'dosage', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <select
                    className="select"
                    value={med.frequency}
                    onChange={(e) => updateRow(idx, 'frequency', e.target.value)}
                  >
                    <option value="Once daily">Once daily (1+0+0)</option>
                    <option value="Twice daily">Twice daily (1+0+1)</option>
                    <option value="Three times daily">Three times (1+1+1)</option>
                    <option value="Four times daily">Four times (1+1+1+1)</option>
                    <option value="As needed (PRN)">As needed (PRN)</option>
                  </select>
                </div>
                <div>
                  <input
                    className="input"
                    type="text"
                    placeholder="Duration (e.g. 7 days)"
                    value={med.duration}
                    onChange={(e) => updateRow(idx, 'duration', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <input
                  className="input"
                  type="text"
                  placeholder="Special instructions (e.g. Take after meal, with plenty of water)"
                  value={med.instructions}
                  onChange={(e) => updateRow(idx, 'instructions', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
