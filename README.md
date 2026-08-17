# E-Health — Centralized Digital Medical Records Platform

> **"One patient. One medical history. One trusted record."**

E-Health is a modern healthcare web application designed to eliminate fragmented patient records and redundant diagnostic testing. It provides a single, chronological medical history for each patient while granting verified healthcare providers (Doctors, Diagnostics Centers, and Hospitals) strict, role-scoped capabilities.

---

## 🌟 Core Features & Role Capabilities

| Role | Permissions & Capabilities |
| :--- | :--- |
| **Patient** | Read-only access to complete lifetime timeline, prescriptions, diagnostic test reports, connected healthcare providers, and emergency profile data. |
| **Doctor** | Search patient registry, review longitudinal clinical history, issue structured e-prescriptions with dosages & instructions, and inspect diagnostic results. |
| **Diagnostics** | Lookup patients by Health ID, upload lab test reports & pathology findings, attach official PDFs/imaging scans, and track facility issuance metrics. |
| **Hospital** | Record inpatient admissions, outpatient consults, emergency triage, hospital-based prescriptions, and manage department records. |

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, React Router v7
- **Icons & Data Display**: Lucide React, CSS Variables Design System
- **Backend & Auth**: Supabase Auth (session persistence & token management)
- **Database & Storage**: PostgreSQL with strict Row Level Security (RLS) & Private Medical Document Storage

---

## 🚀 Getting Started

### 1. Prerequisites & Environment Setup
Create a `.env` file in the root directory (using `.env.example` as a template):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

### 2. Database Schema & RLS Setup
Run the SQL scripts located in `supabase/migrations/` sequentially in your Supabase SQL Editor:
1. `supabase/migrations/001_initial_schema.sql` (Tables, ENUMs, triggers, and helper functions)
2. `supabase/migrations/002_rls_policies.sql` (Role-based access control policies)
3. `supabase/migrations/003_storage.sql` (Private storage bucket and access rules)
4. *(Optional)* `supabase/seed.sql` (Demo data for clinical testing)

### 3. Install & Run Locally
```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Build production bundle
npm run build
```

---

## 👥 Engineering & Architecture
- **Lead Full-Stack Engineer**: Imran ([github.com/imranonweb/ehealth](https://github.com/imranonweb/ehealth))
- **Design Philosophy**: Privacy-by-design, client validation + server-enforced RLS, mobile-responsive layout.
