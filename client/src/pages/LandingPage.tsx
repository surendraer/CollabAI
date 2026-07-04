import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Kanban,
  MessageSquare,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
import { ThemeToggle } from "@/components/common/ThemeToggle";

const features = [
  {
    icon: Kanban,
    title: "Kanban Boards",
    desc: "Drag-and-drop task management with real-time sync across your team.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    desc: "Smart task breakdown, sprint summaries, and bug explanations powered by AI.",
  },
  {
    icon: MessageSquare,
    title: "Team Chat",
    desc: "Real-time messaging with channels, direct messages, and file sharing.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Track productivity, burndown charts, and team performance metrics.",
  },
  {
    icon: Shield,
    title: "Secure",
    desc: "JWT auth, refresh token rotation, RBAC, and enterprise-grade security.",
  },
  {
    icon: Zap,
    title: "Real-time",
    desc: "Live updates, typing indicators, online presence powered by Socket.IO.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas-soft">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-hairline bg-canvas/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-ink">
            <span className="text-xl">🚀</span>
            CollabAI
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-sm font-medium text-ink-muted transition-colors hover:text-ink hidden sm:block"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="hidden sm:flex h-10 items-center rounded-full bg-primary px-6 text-sm font-medium text-on-primary transition-all hover:bg-primary-dark hover:shadow-soft"
            >
              Get started free
            </Link>
            <Link
              to="/register"
              className="sm:hidden flex h-10 items-center rounded-full bg-primary px-4 text-sm font-medium text-on-primary"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section — Dark night band like Notion */}
      <section className="relative overflow-hidden bg-secondary text-on-primary py-24 sm:py-32">
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 sm:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
              Team collaboration
              <br />
              <span className="text-accent-sky">built for shipping</span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-on-primary/80 mb-10">
              Manage projects, track tasks in real-time, chat with your team, and use AI to work smarter—all in one workspace.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-on-primary transition-all hover:bg-primary-dark hover:shadow-elevated active:scale-95"
              >
                Start free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full border-2 border-on-primary/20 bg-transparent px-8 text-base font-semibold text-on-primary transition-all hover:border-on-primary/40 hover:bg-card/10"
              >
                <GithubIcon className="h-5 w-5 mr-2" />
                View on GitHub
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32 bg-canvas-soft">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Complete workspace</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-ink mb-4" style={{ letterSpacing: "-0.02em" }}>
              Everything you need to collaborate
            </h2>
            <p className="text-lg text-ink-muted max-w-2xl mx-auto">
              From project planning to real-time teamwork, CollabAI brings all your collaboration tools together.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-lg bg-surface border border-hairline p-6 transition-all hover:border-primary/30 hover:shadow-soft"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 sm:py-32 bg-canvas">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-ink mb-6" style={{ letterSpacing: "-0.02em" }}>
                Built for how teams actually work
              </h2>
              <ul className="space-y-4">
                {[
                  "Organize projects and tasks with drag-and-drop boards",
                  "Chat with your team instantly, see who's online",
                  "AI-powered insights and task suggestions",
                  "Role-based access control and team permissions",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="h-6 w-6 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="h-3.5 w-3.5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-ink-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-lg p-8 border border-primary/20"
            >
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-accent-sky/30" />
                <div className="h-4 w-2/3 rounded bg-ink/10" />
                <div className="h-4 w-1/2 rounded bg-ink/10" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 sm:py-32 bg-canvas-soft border-t border-hairline">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-ink mb-4" style={{ letterSpacing: "-0.02em" }}>
              Start building together
            </h2>
            <p className="text-lg text-ink-muted mb-8 max-w-xl mx-auto">
              Join teams worldwide who are shipping faster with CollabAI. Set up in minutes, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-on-primary transition-all hover:bg-primary-dark hover:shadow-elevated active:scale-95"
              >
                Create free account
              </Link>
              <Link
                to="/login"
                className="inline-flex h-12 items-center justify-center rounded-full border border-primary text-base font-semibold text-primary transition-all hover:bg-primary/10"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-canvas border-t border-hairline py-12">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-ink mb-3">CollabAI</h3>
              <p className="text-sm text-ink-muted">Modern collaboration platform built for teams.</p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Security"] },
              { title: "Company", links: ["Blog", "GitHub", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Cookies"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-ink text-sm mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-ink-muted hover:text-ink transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-hairline pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-ink-muted">
              © {new Date().getFullYear()} CollabAI. Built for teams, by teams.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-ink-muted hover:text-ink transition-colors"
              >
                <GithubIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
