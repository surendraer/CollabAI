import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left side — Branding */}
      <div className="relative hidden w-1/2 lg:flex lg:flex-col lg:justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-12">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Floating shapes */}
        <motion.div
          className="absolute right-16 top-32 h-72 w-72 rounded-full bg-white/5 blur-3xl"
          animate={{ y: [0, 30, 0], x: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 left-16 h-64 w-64 rounded-full bg-white/5 blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white">⚡ CollabAI</h1>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold leading-tight text-white">
              Collaborate smarter,
              <br />
              <span className="text-brand-200">build faster.</span>
            </h2>
            <p className="mt-4 max-w-md text-lg text-brand-200/80">
              AI-powered workspace for teams that ship. Manage projects,
              track tasks, and communicate in real-time.
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
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-brand-100">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
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
          <p className="text-sm text-brand-300">
            Trusted by teams building the future
          </p>
        </div>
      </div>

      {/* Right side — Form */}
      <div className="flex w-full flex-col lg:w-1/2">
        {/* Top bar */}
        <div className="flex justify-end p-4">
          <ThemeToggle />
        </div>

        {/* Form container */}
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-[400px]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
