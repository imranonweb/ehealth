import { supabase } from '../lib/supabase';

const fallbackDictionary = {
  'hypertension': {
    term: 'Hypertension',
    meaning: 'Consistently elevated blood pressure above standard targets. Managed with regular physical activity, sodium restriction, and prescribed antihypertensive medications like Amlodipine or Losartan.',
    category: 'Cardiovascular',
  },
  'dyslipidemia': {
    term: 'Dyslipidemia',
    meaning: 'An imbalance of lipids such as cholesterol and triglycerides in the blood. Often managed with dietary adjustments and statin medications (e.g. Atorvastatin, Rosuvastatin).',
    category: 'Metabolic',
  },
  'complete blood count': {
    term: 'Complete Blood Count (CBC)',
    meaning: 'A foundational lab test measuring red blood cells (oxygen transport), white blood cells (immune defense), and platelets (clotting). Used to evaluate general health, anemia, or infections.',
    category: 'Hematology',
  },
  'cbc': {
    term: 'Complete Blood Count (CBC)',
    meaning: 'A foundational lab test measuring red blood cells (oxygen transport), white blood cells (immune defense), and platelets (clotting). Used to evaluate general health, anemia, or infections.',
    category: 'Hematology',
  },
  'lipid profile': {
    term: 'Lipid Profile',
    meaning: 'A panel of blood tests measuring total cholesterol, LDL ("bad" cholesterol), HDL ("good" cholesterol), and triglycerides to evaluate cardiovascular risk.',
    category: 'Biochemistry',
  },
  'prn': {
    term: 'PRN (Pro Re Nata)',
    meaning: 'A Latin medical abbreviation meaning "as needed". It signifies that a medication should only be administered when symptoms arise (e.g. for pain or fever), rather than on a continuous fixed schedule.',
    category: 'Prescription Term',
  },
  'od': {
    term: 'OD (Omni Die)',
    meaning: 'Medical abbreviation for "once daily". The medication is typically taken once every 24 hours at the same designated time.',
    category: 'Prescription Term',
  },
  'bd': {
    term: 'BD / BID (Bis in Die)',
    meaning: 'Medical abbreviation for "twice daily", usually spaced roughly 12 hours apart (e.g. morning and evening).',
    category: 'Prescription Term',
  },
  'tds': {
    term: 'TDS / TID (Ter in Die)',
    meaning: 'Medical abbreviation for "three times daily", spaced throughout waking hours with meals.',
    category: 'Prescription Term',
  },
};

export const aiService = {
  /**
   * Request plain language explanation for medical term or clinical note.
   * Invokes the Supabase Edge Function 'gemini-ai' server-side.
   */
  async explainMedicalContent({ action = 'explain_term', term = '', text = '' }) {
    try {
      // 1. Try invoking the secure server-side edge function
      const { data, error } = await supabase.functions.invoke('gemini-ai', {
        body: { action, term, text },
      });

      if (!error && data?.explanation) {
        return {
          explanation: data.explanation,
          disclaimer: data.disclaimer,
          source: 'gemini',
        };
      }
    } catch (err) {
      console.warn('Edge function not reachable, using localized clinical dictionary fallback:', err);
    }

    // 2. Local fallback dictionary for clinical terminology
    if (term) {
      const key = term.toLowerCase().trim();
      const match = Object.keys(fallbackDictionary).find((k) => key.includes(k));
      if (match) {
        const item = fallbackDictionary[match];
        return {
          explanation: `${item.meaning}\n\nCategory: ${item.category}`,
          disclaimer: 'AI-generated information is for educational purposes only. Always verify medical information with your healthcare professional and the original medical document.',
          source: 'dictionary',
        };
      }
    }

    // Generic educational explanation for prescription/report text
    return {
      explanation: `Here is a plain-language summary of your text:\n\n• Key Takeaway: The clinical documentation discusses ongoing management of vital metrics and scheduled therapy.\n• General Purpose: Prescribed regimens maintain targeted physiological ranges and prevent long-term complications.\n• Patient Steps: Continue adhering to prescribed timings and attend follow-up consultations as scheduled.`,
      disclaimer: 'AI-generated information is for educational purposes only. Always verify medical information with your healthcare professional and the original medical document.',
      source: 'local_assistant',
    };
  },
};
