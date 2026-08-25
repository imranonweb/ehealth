# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary — Patient.** A Bangladeshi patient who has accumulated a fragmented medical history across unconnected doctors, diagnostic centres and hospitals. Their job: see one continuous record of what has happened to them, and show it to the next clinician without carrying a folder of paper. They read their record, they never author it. Includes older and low-literacy users reading lab values and dosage instructions.

**Doctor.** A registered practitioner (BMDC registration is the real-world credential) consulting a patient they may not have seen before. Job: review longitudinal history before prescribing, then issue a structured e-prescription.

**Diagnostics centre staff.** A lab technician or front-desk operator at a testing facility. Job: look up a patient by Health ID, upload a completed report plus the official PDF or imaging scan, and have it reach the patient's timeline.

**Hospital records staff.** Job: record inpatient admissions, outpatient consults and emergency triage; issue discharge prescriptions linked to the admission.

**Second real audience — course evaluators.** This is an academic project (see Product Purpose). A supervisor or panel will review and question it. Every screen must be explainable under demonstration and honest about which data is illustrative. Design is judged on defensibility, not conversion.

An `admin` value exists in the `user_role` enum but has no portal, routes or capabilities. Whether it ships is undecided.

## Product Purpose

E-Health is a centralized digital medical records platform that eliminates fragmented patient records and redundant diagnostic testing. It gives each patient a single chronological lifetime medical history while granting verified providers strict, role-scoped write capabilities.

It is an **academic project** — a coursework/capstone build, not a product onboarding real patients. Success means a complete, coherent, defensible system: all four portals functional, privacy model demonstrably enforced, and the demonstration data clearly identifiable as demonstration data.

**The bar, in the team's own words, is that reviewers are amazed — not merely satisfied.** A screen that passes inspection but impresses nobody has missed the goal. This is a stated success criterion, not a stylistic preference, and it applies alongside (never instead of) the honesty requirements in Evidence on Hand.

## Positioning

Providers write; the patient reads. The record is assembled from provider-issued entries into one timeline the patient can never edit and never sees only part of — and access to it is governed by an explicit patient–provider relationship rather than by professional role. A neighboring product cannot truthfully copy the combination: relationship-gated access, a unified cross-institution timeline, and preservation of the original scanned document alongside the structured record.

## Operating Context

Bangladesh. Care is delivered across mutually disconnected institutions — private chambers, diagnostic chains, and hospitals — with no shared record between them. Patients physically carry prescriptions and printed lab reports between providers, and repeat tests because prior results are unavailable.

Factual parts of the workflow:

- **Health ID** — a per-patient identifier (format `P-XXXXXXXX`) the patient shares with a provider to authorize lookup.
- **BMDC registration** — the doctor credential recorded on doctor profiles.
- **The original artifact matters.** Lab results and prescriptions exist as PDFs and imaging scans; these are uploaded, stored privately, and served via short-lived signed URLs.
- **Language split.** Clinical records in Bangladeshi practice are written largely in English; patients read Bangla. The same record is authored in one language and consumed in another.

## Capabilities and Constraints

**Confirmed capabilities.** Patient: read-only lifetime timeline, prescriptions, diagnostic reports, hospital records, connected-provider list, emergency profile data. Doctor: patient lookup, longitudinal history review, structured e-prescriptions with dosage/duration/instructions, diagnostic result review. Diagnostics: Health ID lookup, report upload with categories and reference ranges, PDF/imaging attachment, facility issuance metrics. Hospital: admissions, outpatient and emergency visits, discharge prescriptions linked to the admission, multi-department records.

**Technical.** React 19 + Vite + React Router 7 frontend; Supabase (PostgreSQL, Auth, Storage, Edge Functions) backend. 13 tables with row-level security on all of them; private document storage bucket; audit log table. Plain JavaScript — no TypeScript. Vanilla CSS with custom-property tokens — no CSS framework. No i18n layer exists.

**AI capability is currently inert.** A Supabase Edge Function for Gemini exists at `supabase/functions/gemini-ai/`, but `GEMINI_API_KEY` is unset and the function is undeployed; the app falls back to a local dictionary of roughly eight terms. Do not describe AI features as working until deployed.

**Explicitly undecided.** The accessibility rubric's contents (see Accessibility & Inclusion). Whether the `admin` role ships. Whether the app is ever deployed to a live host.

## Brand Commitments

- **Name:** E-Health.
- **Logo lockup line (binding):** "Connecting Nation's Health" — sits directly beneath the logo wherever the brand mark appears. Recorded verbatim as the team wrote it.
- **Positioning line (binding):** "One patient. One medical history. One trusted record." This is the longer promise used in copy and hero contexts; it is not the logo lockup and the two are not interchangeable.
- **Stated philosophy:** privacy-by-design; client validation paired with server-enforced RLS.
- **Attribution — three people, replacing the README's solo credit:** Md. Al Imran Emon (Lead Developer), Mashuk Rahman (Frontend Developer), Sinthia Akter (UI/UX Designer). The README currently credits only "Imran" as sole engineer and is out of date.
- **Repository:** github.com/imranonweb/ehealth

## Evidence on Hand

**Real:** the working application (~14.8k lines across four portals), the 13-table schema with three migrations, seed data for clinical testing, and the deployed-nowhere-yet Gemini edge function source.

**Illustrative only — must never be presented as real:** every person, institution and clinical value in the landing page and seed data. This includes "Dr. Sarah Rahman", "Rafiq Ahmed", "Green Care Hospital", "Popular Diagnostic Centre", BMDC Reg `A-48291`, Health ID `P-9824F1A2`, and all lab figures (e.g. Serum Cholesterol 210 mg/dL). Note that **"Popular Diagnostic Centre" is the name of a real Bangladeshi company** — using it as demo data is a trademark exposure worth replacing with an obviously fictional name.

**Does not exist. Future work must not fabricate any of it:** users, patient counts, testimonials, hospital or lab partnerships, institutional endorsements, security certifications or audits, uptime or performance figures, press coverage, pricing, and any claim of regulatory approval or HIPAA/GDPR compliance.

## Product Principles

1. **The patient's record is read-only and whole.** Patients never author clinical facts, and never see a partial history. A gap in the timeline is a failure, not an empty state.
2. **Access is a relationship, not a role.** Being a doctor grants nothing; being *this patient's* doctor grants scope. Every provider-facing surface must make the current authorization visible rather than implied.
3. **The original document is the truth.** Structured data supplements the scan or PDF; it never replaces it. Provenance travels with the record.
4. **AI explains; it never advises.** No diagnosis, no dosage change, no treatment recommendation — and its output is always labeled as educational and distinguishable from clinician-issued content.
5. **Demonstrable over impressive.** This will be defended in a review. Prefer a screen that can be explained and proven over one that merely looks accomplished, and never let demo data masquerade as evidence.

## Accessibility & Inclusion

**Binding standard: a university/course rubric governs accessibility requirements for this project.** Its specific contents have not been supplied and are recorded here as an open decision — they must not be invented, and no conformance claim (WCAG level or otherwise) may be published anywhere in the product until the rubric is provided. Paste or name the rubric and this section gets replaced with its actual requirements.

**Bilingual Bangla + English is a binding product requirement.** No i18n layer or Bangla content exists today. Agreed scope for current work: build the *structure* — a typeface that genuinely covers Bangla script, UI strings extracted rather than inlined, and layouts that survive Bangla's text expansion without breaking — while full translation of copy is deferred. Clinical terminology in Bangla must be reviewed by the team before it ships; unreviewed machine-translated medical terms are not acceptable in a health record.

**Functional, not cosmetic:** patients reading their own lab values and dosage instructions include older and low-vision users. Contrast, type size and tap-target size are part of whether the product works, not part of how it looks.
