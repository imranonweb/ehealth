import { supabase } from '../lib/supabase';

export const searchService = {
  /**
   * Comprehensive patient search across:
   * 1. Health ID / Patient Identifier (e.g. P-9824F1A2 or 9824F1A2)
   * 2. Full Name (e.g. Anisur Rahman)
   * 3. Phone Number (e.g. 01711111111)
   * 4. Email (e.g. patient@...)
   */
  async searchPatients(query, { limit = 20 } = {}) {
    if (!query || !query.trim()) return [];

    const raw = query.trim();
    const cleanQ = raw.replace(/[^\w\s@.+-]/gi, '').trim();
    if (!cleanQ) return [];

    try {
      const patientMap = new Map();

      // 1. Try RPC lookup by identifier
      try {
        const { data: rpcData, error: rpcErr } = await supabase.rpc('lookup_patient_by_identifier', {
          p_identifier: cleanQ.toUpperCase(),
        });

        if (!rpcErr && rpcData && Array.isArray(rpcData)) {
          rpcData.forEach((p) => {
            const pid = p.patient_profile_id || p.id;
            if (pid && !patientMap.has(pid)) {
              patientMap.set(pid, {
                id: pid,
                full_name: p.full_name,
                patient_identifier: p.patient_identifier,
                gender: p.gender,
                date_of_birth: p.date_of_birth || null,
                email: p.email || null,
                phone: p.phone || null,
              });
            }
          });
        }
      } catch (e) {
        // Fall through to query
      }

      // 2. Query patient_profiles table by identifier
      try {
        const { data: patProfiles, error: patErr } = await supabase
          .from('patient_profiles')
          .select(`
            profile_id,
            patient_identifier,
            blood_group,
            allergies,
            profile:profile_id (
              id,
              full_name,
              email,
              phone,
              gender,
              date_of_birth,
              role
            )
          `)
          .ilike('patient_identifier', `%${cleanQ}%`)
          .limit(limit);

        if (!patErr && patProfiles && Array.isArray(patProfiles)) {
          patProfiles.forEach((row) => {
            const p = row.profile;
            if (p && p.id && !patientMap.has(p.id)) {
              patientMap.set(p.id, {
                id: p.id,
                full_name: p.full_name,
                email: p.email,
                phone: p.phone,
                gender: p.gender,
                date_of_birth: p.date_of_birth,
                patient_identifier: row.patient_identifier,
                blood_group: row.blood_group,
                allergies: row.allergies,
              });
            }
          });
        }
      } catch (e) {
        // Continue
      }

      // 3. Query profiles table by name, email, or phone
      try {
        const { data: profs, error: profErr } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            email,
            phone,
            gender,
            date_of_birth,
            role,
            patient_profiles (
              patient_identifier,
              blood_group,
              allergies
            )
          `)
          .eq('role', 'patient')
          .or(`full_name.ilike.%${cleanQ}%,email.ilike.%${cleanQ}%,phone.ilike.%${cleanQ}%`)
          .limit(limit);

        if (!profErr && profs && Array.isArray(profs)) {
          profs.forEach((p) => {
            if (p && p.id && !patientMap.has(p.id)) {
              patientMap.set(p.id, {
                id: p.id,
                full_name: p.full_name,
                email: p.email,
                phone: p.phone,
                gender: p.gender,
                date_of_birth: p.date_of_birth,
                patient_identifier: p.patient_profiles?.[0]?.patient_identifier || null,
                blood_group: p.patient_profiles?.[0]?.blood_group || null,
                allergies: p.patient_profiles?.[0]?.allergies || null,
              });
            }
          });
        }
      } catch (e) {
        // Continue
      }

      return Array.from(patientMap.values());
    } catch (err) {
      console.error('searchPatients error:', err);
      return [];
    }
  },

  /**
   * Search by exact patient identifier.
   */
  async searchByPatientId(patientId) {
    if (!patientId) return null;

    try {
      const { data, error } = await supabase.rpc('lookup_patient_by_identifier', {
        p_identifier: patientId.trim().toUpperCase(),
      });

      if (!error && data && data.length > 0) return data[0];
    } catch (e) {
      // Fallback
    }

    const matches = await this.searchPatients(patientId, { limit: 1 });
    return matches.length > 0 ? matches[0] : null;
  },

  /**
   * Get patient profile by ID (UUID).
   */
  async getPatientById(id) {
    if (!id) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, full_name, email, phone, gender, date_of_birth,
          patient_profiles (
            patient_identifier,
            blood_group,
            allergies
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        // Try looking up via patient_profiles
        const { data: patProfile } = await supabase
          .from('patient_profiles')
          .select(`
            profile_id,
            patient_identifier,
            blood_group,
            allergies,
            profile:profile_id (*)
          `)
          .eq('profile_id', id)
          .maybeSingle();

        if (patProfile?.profile) {
          const p = patProfile.profile;
          return {
            id: p.id,
            full_name: p.full_name,
            email: p.email,
            phone: p.phone,
            gender: p.gender,
            date_of_birth: p.date_of_birth,
            patient_identifier: patProfile.patient_identifier,
            blood_group: patProfile.blood_group,
            allergies: patProfile.allergies,
          };
        }
        return null;
      }

      return {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        patient_identifier: data.patient_profiles?.[0]?.patient_identifier || null,
        blood_group: data.patient_profiles?.[0]?.blood_group || null,
        allergies: data.patient_profiles?.[0]?.allergies || null,
      };
    } catch (err) {
      console.error('getPatientById error:', err);
      return null;
    }
  },
};

