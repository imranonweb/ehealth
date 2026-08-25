import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { DiagnosticReportForm } from '../../components/forms/DiagnosticReportForm';

export function DiagnosticsNewReport() {
  return (
    <div className="dashboard-container" style={{ maxWidth: 840 }}>
      <Link
        to="/diagnostics/reports"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 16 }}
      >
        <ChevronLeft size={16} /> Back to Reports
      </Link>

      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Upload Diagnostic Report</h1>
          <p className="page-sub">
            Link structured test findings and official PDF/image documents to a patient record.
          </p>
        </div>
      </div>

      <DiagnosticReportForm redirectPath="/diagnostics/reports" />
    </div>
  );
}
