import Link from "next/link";
import AttriscopeLogo from "@/features/landing/components/AttriscopeLogo";
import {
  btnOutlineOnDark,
  btnPrimaryOnDark,
  linkExplore,
  linkFooter,
} from "@/features/landing/landing-ui";
import { APP_NAME, APP_TAGLINE, attriscopeBrand } from "@/lib/brand";

const PRODUCTS = [
  {
    title: "Dashboard",
    description: "KPIs, risk distribution, engagement trends, and high-priority alerts in one view.",
    href: "/register",
  },
  {
    title: "Risk Analysis",
    description: "Row-level churn scores with risk-level and signal filters for inactivity, usage, support, and payment.",
    href: "/register",
  },
  {
    title: "Data Management",
    description: "Upload CSV files with auto-detected columns, industry-aware mapping, and instant scoring.",
    href: "/register",
  },
  {
    title: "Outreach Hub",
    description: "Draft AI retention emails for high-risk customers and send from one workspace.",
    href: "/register",
  },
];

const SIGNALS = [
  { name: "Login / Inactivity", detail: "Days since last activity or login" },
  { name: "Usage Drop", detail: "Session decline vs previous period" },
  { name: "Support Complaints", detail: "Open tickets and support friction" },
  { name: "Payment Delay", detail: "Late or missed payment flags" },
];

const INDUSTRIES = [
  {
    name: "SaaS",
    weights: "10 / 45 / 15 / 30",
    note: "Prioritizes usage drop and payment delay for subscription businesses.",
  },
  {
    name: "Entertainment",
    weights: "35 / 30 / 20 / 15",
    note: "Weights inactivity and viewing engagement for streaming-style datasets.",
  },
  {
    name: "Education",
    weights: "35 / 25 / 15 / 25",
    note: "Tuned for VLE activity, learner usage, and assessment signals.",
  },
];

const STEPS = [
  { step: "1", title: "Choose your industry", body: "Pick SaaS, Entertainment, or Education and calibrate signal weights." },
  { step: "2", title: "Upload customer data", body: "Import a CSV — columns are auto-mapped to the scoring model." },
  { step: "3", title: "Review risk scores", body: "Open the dashboard and Risk Analysis workspace to prioritize accounts." },
  { step: "4", title: "Act on at-risk accounts", body: "Filter by signal, open customer intelligence, and launch outreach." },
];

const FAQ = [
  {
    q: "What columns should my CSV include?",
    a: "At minimum: customer name, email, and your activity signals (login/inactivity, sessions, support tickets, payment status). Billing cycle is optional but recommended. Column names are auto-detected from common variations.",
  },
  {
    q: "Can I adjust scoring for my business?",
    a: "Yes. Pick an industry preset in onboarding, then fine-tune the four signal weights in Settings. Reset to default anytime.",
  },
];

function SectionLabel({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <p
      className={`text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] mb-2 sm:mb-3 ${
        light ? "text-blue-200" : "text-blue-600"
      }`}
    >
      {children}
    </p>
  );
}

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen bg-gray-100 text-gray-900 overflow-x-hidden">
      {/* Hero — same gradient as login left panel */}
      <section
        className="relative overflow-hidden text-white"
        style={{ background: attriscopeBrand.gradient }}
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 sm:top-20 right-4 sm:right-10 w-48 sm:w-72 h-48 sm:h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-4 sm:left-10 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-blue-300 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-3 sm:px-6 py-8 sm:py-12 md:py-16 lg:py-24 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
          <div className="order-2 md:order-1 text-center md:text-left">
            <SectionLabel light>Customer success & retention</SectionLabel>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-snug sm:leading-[1.15] mb-3 sm:mb-4 md:mb-5 text-balance">
              See churn risk before customers leave.
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-blue-100 leading-relaxed mb-5 sm:mb-6 md:mb-8 max-w-xl mx-auto md:mx-0">
              Score every account from real customer signals and act before churn happens.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center md:justify-start gap-3">
              <Link href="/register" className={`w-full sm:w-auto ${btnPrimaryOnDark}`}>
                Start free
              </Link>
              <Link href="/login" className={`w-full sm:w-auto ${btnOutlineOnDark}`}>
                Sign in to workspace
              </Link>
            </div>
          </div>
          <div className="order-1 md:order-2 bg-white/10 backdrop-blur border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-lg mx-auto md:max-w-none">
            <p className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wide sm:tracking-widest text-blue-200 mb-3 sm:mb-4">
              At a glance
            </p>
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1">0 – 100</p>
            <p className="text-xs sm:text-sm text-blue-100 mb-4 sm:mb-6">Churn risk score per customer</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {["Dashboard", "Risk Analysis", "CSV import", "Outreach"].map((tag) => (
                <span key={tag} className="text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/15 text-blue-50">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gray-50 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-14">
            <SectionLabel>Platform</SectionLabel>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 md:mb-4 px-1 sm:px-2 text-balance">
              One workspace for risk, data, and retention.
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 px-1 sm:px-2 leading-relaxed">
              From CSV import to outreach — built for teams who need clarity on which customers are slipping away.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            {PRODUCTS.map((product) => (
              <div
                key={product.title}
                className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all h-full flex flex-col"
              >
                <h3 className="font-bold text-sm sm:text-base md:text-lg mb-1.5 sm:mb-2 text-blue-900">{product.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3 sm:mb-4 flex-1">{product.description}</p>
                <Link href={product.href} className={linkExplore}>
                  Explore →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-8 sm:py-12 md:py-16 lg:py-20 scroll-mt-20">
        <div className="max-w-3xl mx-auto px-3 sm:px-6">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <SectionLabel>Workflow</SectionLabel>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-balance">From upload to action in four steps.</h2>
          </div>
          <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
            {STEPS.map((item) => (
              <div key={item.step} className="flex gap-2.5 sm:gap-3 md:gap-4 p-3.5 sm:p-4 md:p-5 rounded-xl border border-gray-200 bg-white">
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-blue-700 text-white text-xs sm:text-sm md:text-base font-bold flex items-center justify-center shrink-0">
                  {item.step}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold mb-0.5 sm:mb-1 text-xs sm:text-sm md:text-base">{item.title}</h3>
                  <p className="text-[11px] sm:text-xs md:text-sm text-gray-600 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signals */}
      <section
        id="signals"
        className="py-8 sm:py-12 md:py-16 lg:py-20 text-white scroll-mt-20"
        style={{ background: attriscopeBrand.gradient }}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-14">
            <SectionLabel light>Scoring model</SectionLabel>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 md:mb-4 text-balance">Four signals. One fair risk score.</h2>
            <p className="text-xs sm:text-sm md:text-base text-blue-200 leading-relaxed">
              The same formula across industries — with weights and CSV mapping tailored to how each sector measures churn.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {SIGNALS.map((signal) => (
              <div key={signal.name} className="bg-white/10 border border-white/15 rounded-xl p-3.5 sm:p-4 md:p-5">
                <h3 className="font-bold mb-1.5 sm:mb-2 text-xs sm:text-sm md:text-base">{signal.name}</h3>
                <p className="text-[11px] sm:text-xs md:text-sm text-blue-100 leading-relaxed">{signal.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] sm:text-xs md:text-sm text-blue-200 mt-5 sm:mt-6 md:mt-8 px-2 leading-relaxed max-w-3xl mx-auto">
            High risk ≥ 70 · Medium 40–69 · Low {"<"} 40 · Billing-cycle caps keep monthly and yearly plans comparable.
          </p>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gray-50 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-14">
            <SectionLabel>Industry profiles</SectionLabel>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 md:mb-4 text-balance">
              Built for SaaS, Entertainment, and Education.
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
              Start with a preset weight profile, then fine-tune sliders in Settings to match how your business defines risk.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {INDUSTRIES.map((ind) => (
              <div key={ind.name} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm h-full">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-blue-900 mb-1.5 sm:mb-2">{ind.name}</h3>
                <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wide sm:tracking-wider mb-2 sm:mb-3 leading-snug">
                  Default weights (inactivity / usage / support / payment)
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700 mb-2 sm:mb-3 md:mb-4 font-mono break-words">
                  {ind.weights}
                </p>
                <p className="text-[11px] sm:text-xs md:text-sm text-gray-600 leading-relaxed">{ind.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gray-50 scroll-mt-20">
        <div className="max-w-3xl mx-auto px-3 sm:px-6">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Common questions</h2>
          </div>
          <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group bg-white border border-gray-200 rounded-xl p-3.5 sm:p-4 md:p-5 open:shadow-sm"
              >
                <summary className="font-bold cursor-pointer list-none flex justify-between items-start gap-2 sm:gap-3 text-xs sm:text-sm md:text-base text-gray-900 hover:text-blue-900 transition-colors">
                  <span className="text-left pr-1 sm:pr-2 flex-1 break-words">{item.q}</span>
                  <span className="text-blue-700 group-open:rotate-45 group-hover:text-blue-900 transition-all text-lg sm:text-xl leading-none shrink-0 mt-0.5">
                    +
                  </span>
                </summary>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3 leading-relaxed break-words">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 sm:py-12 md:py-16 text-white" style={{ background: attriscopeBrand.gradient }}>
        <div className="max-w-3xl mx-auto px-3 sm:px-6 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 md:mb-4 text-balance">Ready to score your customer base?</h2>
          <p className="text-xs sm:text-sm md:text-base text-blue-200 mb-5 sm:mb-6 md:mb-8 leading-relaxed">
            Create a free account and upload your first CSV.
          </p>
          <Link href="/register" className={`w-full sm:w-auto px-8 ${btnPrimaryOnDark}`}>
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 sm:py-8 md:py-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-6 text-center sm:text-left">
          <AttriscopeLogo href="/" className="justify-center sm:justify-start" />
          <p className="text-[10px] sm:text-xs text-gray-500 order-3 sm:order-none leading-relaxed">
            © 2026 {APP_NAME}. {APP_TAGLINE}
          </p>
          <div className="flex gap-4 sm:gap-5 md:gap-6 text-gray-600 order-2 sm:order-none">
            <Link href="/login" className={linkFooter}>Sign in</Link>
            <Link href="/register" className={linkFooter}>Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
