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
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-[var(--primary)]">
            <span>⚡</span>
            CollabAI
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="flex h-9 items-center rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[var(--primary)]/5 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-1.5 text-sm text-[var(--muted-foreground)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
              AI-Powered Collaboration Platform
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
              Build together,
              <br />
              <span className="bg-gradient-to-r from-[var(--primary)] to-purple-500 bg-clip-text text-transparent">
                ship faster
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted-foreground)]">
              The all-in-one workspace for modern teams. Manage projects,
              collaborate in real-time, and leverage AI to boost productivity.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/register"
                className="group flex h-12 items-center gap-2 rounded-xl bg-[var(--primary)] px-8 text-base font-semibold text-[var(--primary-foreground)] transition-all hover:shadow-lg hover:shadow-[var(--primary)]/25"
              >
                Start for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-8 text-base font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]"
              >
                <GithubIcon className="h-5 w-5" />
                View on GitHub
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[var(--border)] py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-[var(--foreground)] lg:text-4xl">
              Everything your team needs
            </h2>
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">
              A complete suite of tools designed for modern team collaboration.
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--primary)]/30 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10 transition-colors group-hover:bg-[var(--primary)]/20">
                  <feature.icon className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-[var(--border)] py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-[var(--foreground)]">
              Ready to get started?
            </h2>
            <p className="mt-3 text-lg text-[var(--muted-foreground)]">
              Join teams that ship faster with CollabAI.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-[var(--primary)] px-8 text-base font-semibold text-[var(--primary-foreground)] transition-all hover:shadow-lg hover:shadow-[var(--primary)]/25"
            >
              Create free account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <span className="text-sm text-[var(--muted-foreground)]">
              © {new Date().getFullYear()} CollabAI. Built with ❤️ using MERN
              Stack.
            </span>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
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
