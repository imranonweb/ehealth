import { useState } from 'react';
import {
  Sparkles, Pill, FlaskConical, AlertTriangle, Search, BookOpen, Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { aiService } from '../../services/aiService';

const sampleTerms = [
  {
    term: 'Hypertension Stage 1',
    meaning: 'Consistently elevated blood pressure (typically systolic 130-139 or diastolic 80-89 mmHg). Requires healthy diet, reduced sodium, exercise, and often prescribed medication like Amlodipine or Losartan.',
    category: 'Cardiovascular',
  },
  {
    term: 'Dyslipidemia',
    meaning: 'An abnormal amount of lipids (cholesterol and/or fat) in the blood. Often characterized by high LDL ("bad cholesterol") or high triglycerides. Managed with statins and lifestyle changes.',
    category: 'Metabolic',
  },
  {
    term: 'Complete Blood Count (CBC)',
    meaning: 'A standard blood test that measures red blood cells (carries oxygen), white blood cells (fights infections), and platelets (helps blood clot). Helps evaluate overall health and detect infections or anemia.',
    category: 'Hematology',
  },
  {
    term: 'Subclinical Hypothyroidism',
    meaning: 'A condition where the thyroid gland is mildly underactive (TSH is slightly high, but thyroid hormones FT4 are normal). May cause fatigue or weight gain, often treated with Levothyroxine.',
    category: 'Endocrinology',
  },
  {
    term: 'PRN (Pro Re Nata)',
    meaning: 'A Latin medical abbreviation meaning "as needed". It indicates that a medicine should only be taken when symptoms occur (e.g. for pain or fever), rather than on a fixed continuous schedule.',
    category: 'Prescription Term',
  },
];

export function PatientAiAssistant() {
  const { profile } = useAuth();
  const [selectedTool, setSelectedTool] = useState('term');
  const [queryTerm, setQueryTerm] = useState('');
  const [termResult, setTermResult] = useState(null);
  const [inputText, setInputText] = useState('');
  const [explanationOutput, setExplanationOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLookupTerm = async (termObj) => {
    setQueryTerm(termObj.term);
    setLoading(true);
    try {
      const res = await aiService.explainMedicalContent({ action: 'explain_term', term: termObj.term });
      setTermResult({
        term: termObj.term,
        meaning: res.explanation,
        category: termObj.category || 'Clinical Term',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCustomTerm = async (e) => {
    e.preventDefault();
    if (!queryTerm.trim()) return;

    setLoading(true);
    try {
      const res = await aiService.explainMedicalContent({ action: 'explain_term', term: queryTerm.trim() });
      setTermResult({
        term: queryTerm.trim(),
        meaning: res.explanation,
        category: 'Clinical Terminology',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateExplanation = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const action = selectedTool === 'prescription' ? 'explain_prescription' : 'explain_report';
      const res = await aiService.explainMedicalContent({ action, text: inputText.trim() });
      setExplanationOutput(res.explanation);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: 960 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="badge badge-primary">
              <Sparkles size={13} /> Educational Assistant
            </span>
            <span className="badge" style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-muted)' }}>
              Non-Diagnostic
            </span>
          </div>
          <h1 className="page-title">
            AI Health Explanation Assistant
          </h1>
          <p className="page-sub">
            Understand medical terminology, medication schedules, and laboratory report findings in plain language.
          </p>
        </div>
      </div>

      {/* Mandatory Safety Notice */}
      <div className="card" style={{
        padding: '16px 20px',
        marginBottom: 'var(--sp-6)',
        backgroundColor: 'var(--color-warning-bg)',
        border: '1.5px solid rgba(217, 119, 6, 0.4)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <AlertTriangle size={20} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Mandatory Medical & Safety Disclaimer
            </h4>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              <strong>AI-generated information is for educational purposes only. Always verify medical information with your healthcare professional and the original medical document.</strong>
            </p>
            <div style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              The AI assistant will <strong>never</strong> diagnose conditions, prescribe medications, change dosages, recommend stopping prescribed therapies, or replace professional clinical judgment.
            </div>
          </div>
        </div>
      </div>

      {/* Tool Selector Tabs */}
      <div className="grid-3" style={{ gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <button
          type="button"
          className="card card-hover"
          onClick={() => { setSelectedTool('term'); setExplanationOutput(null); }}
          style={{
            padding: 'var(--sp-5)',
            textAlign: 'left',
            cursor: 'pointer',
            borderColor: selectedTool === 'term' ? 'var(--accent)' : 'var(--border-default)',
            backgroundColor: selectedTool === 'term' ? 'var(--accent-subtle)' : 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <BookOpen size={20} color="var(--accent)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Medical Term Simplifier
            </h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
            Translate Latin abbreviations, clinical test codes, and complex diagnoses.
          </p>
        </button>

        <button
          type="button"
          className="card card-hover"
          onClick={() => { setSelectedTool('prescription'); setExplanationOutput(null); }}
          style={{
            padding: 'var(--sp-5)',
            textAlign: 'left',
            cursor: 'pointer',
            borderColor: selectedTool === 'prescription' ? 'var(--accent)' : 'var(--border-default)',
            backgroundColor: selectedTool === 'prescription' ? 'var(--accent-subtle)' : 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Pill size={20} color="var(--color-blue)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Explain Prescription
            </h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
            Break down dosage timing, meal instructions, and medication purpose.
          </p>
        </button>

        <button
          type="button"
          className="card card-hover"
          onClick={() => { setSelectedTool('report'); setExplanationOutput(null); }}
          style={{
            padding: 'var(--sp-5)',
            textAlign: 'left',
            cursor: 'pointer',
            borderColor: selectedTool === 'report' ? 'var(--accent)' : 'var(--border-default)',
            backgroundColor: selectedTool === 'report' ? 'var(--accent-subtle)' : 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <FlaskConical size={20} color="var(--color-purple)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Explain Lab Findings
            </h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
            Understand standard physiological reference ranges and lab parameters.
          </p>
        </button>
      </div>

      {/* Main Interactive Tool Area */}
      {selectedTool === 'term' && (
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>
            Medical Terminology Lookup
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Type any medical term from your records or choose from common clinical terms below:
          </p>

          <form onSubmit={handleSearchCustomTerm} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} className="input-icon" />
              <input
                type="text"
                className="input has-icon"
                placeholder="Type a medical term (e.g. Hypertension, Lipid Profile, TSH, PRN)..."
                value={queryTerm}
                onChange={(e) => setQueryTerm(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-md" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : 'Explain Term'}
            </button>
          </form>

          {/* Quick Clickable Suggestions */}
          <div style={{ marginBottom: 24 }}>
            <span className="label" style={{ display: 'block', marginBottom: 8 }}>
              Common Clinical Terms in Records
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {sampleTerms.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLookupTerm(t)}
                  className={`btn btn-sm ${queryTerm === t.term ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8125rem' }}
                >
                  {t.term}
                </button>
              ))}
            </div>
          </div>

          {/* Result Box */}
          {termResult && (
            <div style={{
              padding: '18px 20px',
              backgroundColor: 'var(--bg-surface-muted)',
              border: '1.5px solid var(--accent)',
              borderRadius: 'var(--radius-lg)',
              animation: 'fadeIn 0.2s ease both',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h4 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {termResult.term}
                </h4>
                <span className="badge badge-primary">
                  {termResult.category}
                </span>
              </div>
              <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                {termResult.meaning}
              </p>
            </div>
          )}
        </div>
      )}

      {(selectedTool === 'prescription' || selectedTool === 'report') && (
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Sparkles size={20} color="var(--accent)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              {selectedTool === 'prescription' ? 'Explain Prescription Text' : 'Explain Diagnostic Test Findings'}
            </h3>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Paste the doctor's clinical notes or test parameters below to generate a plain-language explanation:
          </p>

          <textarea
            className="textarea"
            placeholder={selectedTool === 'prescription' ? "Paste prescription instructions (e.g. Tab Amlodipine 5mg 1+0+0 for 30 days, low salt diet, review in 3 months)..." : "Paste lab findings (e.g. Fasting Blood Glucose 6.8 mmol/L, HbA1c 6.4%, normal liver function tests)..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ minHeight: 110, marginBottom: 14 }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span className="caption">
              🔒 Educational assistance only.
            </span>
            <button
              type="button"
              className="btn btn-primary btn-md"
              onClick={handleGenerateExplanation}
              disabled={loading || !inputText.trim()}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" /> Analyzing text…
                </>
              ) : (
                'Generate Plain Explanation'
              )}
            </button>
          </div>

          {explanationOutput && (
            <div style={{
              marginTop: 20,
              padding: '18px 20px',
              backgroundColor: 'var(--bg-surface-muted)',
              border: '1.5px solid var(--accent)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.84375rem',
              color: 'var(--text-primary)',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>
                AI Plain-Language Explanation
              </div>
              {explanationOutput}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
