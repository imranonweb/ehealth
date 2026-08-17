import { useState } from 'react';
import {
  Sparkles, Pill, FlaskConical, FileText, AlertTriangle, Search,
  Bot, HelpCircle, ArrowRight, CheckCircle2, ShieldAlert, BookOpen, Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
  const [isSimulating, setIsSimulating] = useState(false);

  const handleLookupTerm = (termObj) => {
    setQueryTerm(termObj.term);
    setTermResult(termObj);
  };

  const handleSearchCustomTerm = (e) => {
    e.preventDefault();
    if (!queryTerm.trim()) return;

    const match = sampleTerms.find((t) => t.term.toLowerCase().includes(queryTerm.toLowerCase()));
    if (match) {
      setTermResult(match);
    } else {
      setTermResult({
        term: queryTerm,
        meaning: `"${queryTerm}" is a clinical term. In standard medical references, this represents a specific diagnosis or measurement. Please refer to your attending doctor's notes or check with your pharmacist for a personalized clinical explanation.`,
        category: 'General Clinical Term',
      });
    }
  };

  const handleSimulateExplanation = () => {
    if (!inputText.trim()) return;
    setIsSimulating(true);
    setTimeout(() => {
      setExplanationOutput(`Here is a plain-language summary of your text:\n\n• Key Point: Clinical documentation discusses management of current vital metrics and planned medication regimens.\n• Purpose: The prescribed regimen is aimed at maintaining target physiological ranges and preventing long-term complications.\n• Patient Action: Continue prescribed dosages at the designated times, maintain home logs where advised, and attend the scheduled follow-up.`);
      setIsSimulating(false);
    }, 1200);
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: 960 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="badge" style={{ background: 'linear-gradient(135deg, rgba(15,118,110,0.15), rgba(20,184,166,0.25))', color: 'var(--primary)', fontWeight: 700 }}>
              <Sparkles size={13} style={{ marginRight: 4 }} /> Educational Assistant
            </span>
            <span className="badge" style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}>
              Non-Diagnostic
            </span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
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
        background: 'var(--warning-bg)',
        border: '1.5px solid var(--warning)',
        borderRadius: 'var(--r-lg)',
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <AlertTriangle size={22} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-1)' }}>
              Mandatory Medical & Safety Disclaimer
            </h4>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-1)', lineHeight: 1.5 }}>
              <strong>AI-generated information is for educational purposes only. Always verify medical information with your healthcare professional and the original medical document.</strong>
            </p>
            <div style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--text-2)' }}>
              The AI assistant will <strong>never</strong> diagnose conditions, prescribe medications, change dosages, recommend stopping prescribed therapies, or replace professional clinical judgment.
            </div>
          </div>
        </div>
      </div>

      {/* Tool Selector Tabs */}
      <div className="grid-3" style={{ gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <button
          type="button"
          className={`card card-hover ${selectedTool === 'term' ? 'active-tool' : ''}`}
          onClick={() => setSelectedTool('term')}
          style={{
            padding: 'var(--sp-5)',
            textAlign: 'left',
            cursor: 'pointer',
            border: selectedTool === 'term' ? '2px solid var(--primary)' : '1px solid var(--border)',
            background: selectedTool === 'term' ? 'var(--primary-light)' : 'var(--surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <BookOpen size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
              Medical Term Simplifier
            </h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', margin: 0, lineHeight: 1.4 }}>
            Translate Latin abbreviations, clinical test codes, and complex diagnoses.
          </p>
        </button>

        <button
          type="button"
          className={`card card-hover ${selectedTool === 'prescription' ? 'active-tool' : ''}`}
          onClick={() => setSelectedTool('prescription')}
          style={{
            padding: 'var(--sp-5)',
            textAlign: 'left',
            cursor: 'pointer',
            border: selectedTool === 'prescription' ? '2px solid var(--primary)' : '1px solid var(--border)',
            background: selectedTool === 'prescription' ? 'var(--primary-light)' : 'var(--surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Pill size={20} color="#3B82F6" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
              Explain Prescription
            </h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', margin: 0, lineHeight: 1.4 }}>
            Break down dosage timing, meal instructions, and medication purpose.
          </p>
        </button>

        <button
          type="button"
          className={`card card-hover ${selectedTool === 'report' ? 'active-tool' : ''}`}
          onClick={() => setSelectedTool('report')}
          style={{
            padding: 'var(--sp-5)',
            textAlign: 'left',
            cursor: 'pointer',
            border: selectedTool === 'report' ? '2px solid var(--primary)' : '1px solid var(--border)',
            background: selectedTool === 'report' ? 'var(--primary-light)' : 'var(--surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <FlaskConical size={20} color="#8B5CF6" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
              Explain Lab Findings
            </h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', margin: 0, lineHeight: 1.4 }}>
            Understand standard physiological reference ranges and lab parameters.
          </p>
        </button>
      </div>

      {/* Main Interactive Tool Area */}
      {selectedTool === 'term' && (
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: 12 }}>
            Medical Terminology Lookup
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', marginBottom: 16 }}>
            Type any medical term from your records or choose from common clinical terms below:
          </p>

          <form onSubmit={handleSearchCustomTerm} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
              <input
                type="text"
                className="input has-icon"
                placeholder="Type a medical term (e.g. Hypertension, Lipid Profile, TSH, PRN)..."
                value={queryTerm}
                onChange={(e) => setQueryTerm(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-md">
              Explain Term
            </button>
          </form>

          {/* Quick Clickable Suggestions */}
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', display: 'block', marginBottom: 8, letterSpacing: '0.04em' }}>
              Common Clinical Terms in Records
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {sampleTerms.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLookupTerm(t)}
                  className="badge"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8125rem',
                    background: queryTerm === t.term ? 'var(--primary)' : 'var(--surface-2)',
                    color: queryTerm === t.term ? '#fff' : 'var(--text-1)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
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
              background: 'var(--surface-2)',
              border: '1.5px solid var(--primary)',
              borderRadius: 'var(--r-lg)',
              animation: 'fadeIn 0.2s ease both',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>
                  {termResult.term}
                </h4>
                <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>
                  {termResult.category}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
                {termResult.meaning}
              </p>
            </div>
          )}
        </div>
      )}

      {(selectedTool === 'prescription' || selectedTool === 'report') && (
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Sparkles size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0 }}>
              {selectedTool === 'prescription' ? 'Explain Prescription Text' : 'Explain Diagnostic Test Findings'}
            </h3>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', marginBottom: 16 }}>
            Paste the doctor's clinical notes or test parameters below to generate a plain-language explanation:
          </p>

          <textarea
            className="textarea"
            placeholder={selectedTool === 'prescription' ? "Paste prescription instructions (e.g. Tab Amlodipine 5mg 1+0+0 for 3 months, low salt diet, review in 3 months)..." : "Paste lab findings (e.g. Fasting Blood Glucose 6.8 mmol/L, HbA1c 6.4%, normal liver function tests)..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ minHeight: 110, marginBottom: 14 }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
              🔒 Processed locally in accordance with patient data isolation rules.
            </span>
            <button
              type="button"
              className="btn btn-primary btn-md"
              onClick={handleSimulateExplanation}
              disabled={isSimulating || !inputText.trim()}
            >
              {isSimulating ? 'Analyzing text…' : 'Generate Plain Explanation'}
            </button>
          </div>

          {explanationOutput && (
            <div style={{
              marginTop: 20,
              padding: '18px 20px',
              background: 'var(--surface-2)',
              border: '1.5px solid var(--primary)',
              borderRadius: 'var(--r-lg)',
              fontSize: '0.875rem',
              color: 'var(--text-1)',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
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
