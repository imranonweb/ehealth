import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';

export function AboutUs() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />

      <main style={{ flex: 1 }}>
        {/* Mission Hero */}
        <section style={{ padding: '80px 0 60px', borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: 800 }}>
            <span className="label">Our Mission</span>
            <h1 className="h1" style={{ margin: '16px 0 24px', fontSize: '2.5rem', letterSpacing: '-0.035em' }}>
              One Patient. One Record.<br />
              <span style={{ color: 'var(--accent)' }}>Trusted Everywhere.</span>
            </h1>
            <p className="body-lg" style={{ color: 'var(--text-secondary)', margin: '0 auto', maxWidth: 640 }}>
              E-Health was built on a simple premise: a patient's medical history should travel with them. By centralizing prescriptions, diagnostic reports, and hospital records under a single, secure architecture, we empower clinicians to make fully informed decisions and give patients true ownership of their health data.
            </p>
          </div>
        </section>

        {/* The Team */}
        <section style={{ padding: '80px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 className="h2">The Engineering Team</h2>
              <p className="body" style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
                The core developers and designers building the E-Health platform.
              </p>
            </div>

            <div className="grid-3">
              {/* Profile: Imran */}
              <div className="card card-hover" style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="avatar avatar-xl avatar-teal" style={{ marginBottom: 20 }}>AE</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Md. Al Imran Emon</h3>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Lead Developer</div>
              </div>

              {/* Profile: Mashuk */}
              <div className="card card-hover" style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="avatar avatar-xl avatar-blue" style={{ marginBottom: 20 }}>MR</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Mashuk Rahman</h3>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Frontend Developer</div>
              </div>

              {/* Profile: Sinthia */}
              <div className="card card-hover" style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="avatar avatar-xl avatar-purple" style={{ marginBottom: 20 }}>SA</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Sinthia Akter</h3>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>UI/UX Designer</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
