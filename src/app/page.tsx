import Link from "next/link";

const features = [
  {
    icon: "📊",
    title: "Predictive Analytics",
    description:
      "ML models score every customer daily so you always know who is about to leave.",
  },
  {
    icon: "🎯",
    title: "Actionable Segments",
    description:
      "Automatically group at-risk customers by behaviour, lifetime value, and churn probability.",
  },
  {
    icon: "⚡",
    title: "Real-time Alerts",
    description:
      "Get notified the moment a customer's risk score crosses your threshold — via email, Slack, or webhook.",
  },
  {
    icon: "🔒",
    title: "Enterprise Security",
    description:
      "SOC 2 Type II certified, GDPR-ready, fully encrypted at rest and in transit.",
  },
];

const stats = [
  { value: "94%",  label: "Prediction accuracy" },
  { value: "3×",   label: "Avg. retention lift" },
  { value: "48 h", label: "Time to first insight" },
  { value: "500+", label: "Teams worldwide" },
];

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}>

      {/* ── Nav ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", backdropFilter: "blur(8px)" }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--color-primary)" }}>
            ChurnIQ
          </span>
          <nav style={{ display: "flex", gap: "2rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-secondary)" }}>
            <a href="#features" style={{ textDecoration: "none", color: "inherit" }}>Features</a>
            <a href="#stats"    style={{ textDecoration: "none", color: "inherit" }}>Results</a>
            <a href="#pricing"  style={{ textDecoration: "none", color: "inherit" }}>Pricing</a>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="/login" style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-secondary)", textDecoration: "none", padding: "0.5rem 1rem" }}>
              Log in
            </Link>
            <Link href="/signup" style={{ borderRadius: "var(--radius-lg)", padding: "0.5rem 1.25rem", fontSize: "0.875rem", fontWeight: 600, color: "#fff", backgroundColor: "var(--color-primary)", textDecoration: "none" }}>
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>

        {/* ── Hero ── */}
        <section style={{ width: "100%", padding: "6rem 1.5rem" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem", textAlign: "center" }}>
            <span style={{ display: "inline-block", borderRadius: "9999px", padding: "0.25rem 1rem", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)", color: "var(--color-primary)" }}>
              Now in public beta
            </span>

            <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 3.75rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", color: "var(--color-text-primary)", margin: 0 }}>
              Stop losing customers<br />
              <span style={{ color: "var(--color-primary)" }}>before it happens.</span>
            </h1>

            <p style={{ fontSize: "1.125rem", lineHeight: 1.75, color: "var(--color-text-secondary)", maxWidth: 520, margin: 0 }}>
              ChurnIQ uses AI to identify which customers are at risk of leaving — days or weeks in advance — giving your team time to act.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/signup" style={{ borderRadius: "var(--radius-xl)", padding: "0.875rem 2rem", fontSize: "1rem", fontWeight: 600, color: "#fff", backgroundColor: "var(--color-primary)", textDecoration: "none", boxShadow: "var(--shadow-lg)" }}>
                Start for free
              </Link>
              <Link href="#features" style={{ borderRadius: "var(--radius-xl)", padding: "0.875rem 2rem", fontSize: "1rem", fontWeight: 500, color: "var(--color-text-primary)", border: "1px solid var(--color-border)", textDecoration: "none", backgroundColor: "transparent" }}>
                See how it works
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <section id="stats" style={{ width: "100%", backgroundColor: "var(--color-surface)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
            {stats.map(({ value, label }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.375rem", padding: "2.5rem 1.5rem", borderRight: "1px solid var(--color-border)" }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 800, fontVariantNumeric: "tabular-nums", color: "var(--color-primary)" }}>
                  {value}
                </span>
                <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" style={{ width: "100%", padding: "6rem 1.5rem" }}>
          <div style={{ maxWidth: 1152, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--color-text-primary)", margin: "0 0 1rem" }}>
                Everything you need to retain customers
              </h2>
              <p style={{ fontSize: "1.125rem", color: "var(--color-text-secondary)", margin: 0 }}>
                One platform from raw data to retention campaigns.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
              {features.map(({ icon, title, description }) => (
                <div
                  key={title}
                  style={{ display: "flex", flexDirection: "column", gap: "1rem", borderRadius: "var(--radius-2xl)", border: "1px solid var(--color-border)", padding: "1.75rem", backgroundColor: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }}
                >
                  <span style={{ fontSize: "2rem" }}>{icon}</span>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", lineHeight: 1.75, color: "var(--color-text-secondary)", margin: 0 }}>
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA banner ── */}
        <section id="pricing" style={{ width: "100%", padding: "0 1.5rem 6rem" }}>
          <div style={{ maxWidth: 1152, margin: "0 auto", borderRadius: "var(--radius-2xl)", padding: "5rem 2rem", textAlign: "center", background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700, color: "#fff", margin: "0 0 1rem" }}>
              Ready to reduce churn by up to 40%?
            </h2>
            <p style={{ fontSize: "1.125rem", color: "rgba(255,255,255,0.8)", margin: "0 0 2.5rem" }}>
              Connect your data source in minutes. No credit card required.
            </p>
            <Link href="/signup" style={{ display: "inline-block", borderRadius: "var(--radius-xl)", padding: "0.875rem 2.5rem", fontSize: "1rem", fontWeight: 700, backgroundColor: "#fff", color: "var(--color-primary)", textDecoration: "none" }}>
              Get started free
            </Link>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid var(--color-border)", padding: "2rem 1.5rem", textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
        © {new Date().getFullYear()} ChurnIQ. All rights reserved.
      </footer>
    </div>
  );
}
