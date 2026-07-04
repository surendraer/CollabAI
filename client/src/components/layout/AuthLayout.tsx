import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left side — Branding (Notion night band) */}
      <div className="relative hidden w-1/2 lg:flex lg:flex-col lg:justify-between overflow-hidden bg-secondary p-12">
        {/* Starfield background */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 1px)`,
              backgroundSize: "80px 80px",
            }}
          />
        </div>

        {/* Floating accent shapes */}
        <motion.div
          className="absolute right-20 top-40 h-64 w-64 rounded-full bg-accent-sky/20 blur-3xl"
          animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-40 left-20 h-72 w-72 rounded-full bg-accent-purple/15 blur-3xl"
          animate={{ y: [0, -30, 0], x: [0, 25, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 h-48 w-48 rounded-full bg-accent-pink/10 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white">🚀 CollabAI</h1>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-5xl font-bold leading-tight text-white mb-6" style={{ letterSpacing: "-0.02em" }}>
              Collaborate smarter,
              <br />
              <span className="text-accent-sky">ship faster</span>
            </h2>
            <p className="max-w-md text-lg text-white/70">
              Manage projects, track tasks in real-time, chat with your team, and use AI to work smarter—all in one workspace.
            </p>
          </motion.div>

          {/* Feature bullets */}
          <motion.div
            className="mt-10 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {[
              "Real-time Kanban boards & task management",
              "AI-powered insights & task breakdown",
              "Team chat with instant notifications",
              "Enterprise-grade security & RBAC",
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3 text-white/80">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-card/15 flex-shrink-0 mt-0.5">
                  <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-sm text-white/60">
            Trusted by teams shipping the future
          </p>
        </div>
      </div>

      {/* Right side — Form */}
      <div className="flex w-full flex-col lg:w-1/2 bg-canvas-soft">
        {/* Top bar */}
        <div className="flex justify-between items-center p-6 sm:p-8 border-b border-hairline">
          <Link to="/" className="text-sm font-medium text-ink hover:text-primary transition-colors flex lg:hidden items-center gap-1">
            ← Back
          </Link>
          <ThemeToggle />
        </div>

        {/* Form container */}
        <div className="flex flex-1 items-center justify-center px-6 sm:px-8 py-12">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
