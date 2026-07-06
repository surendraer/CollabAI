import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { BookOpen } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-[#ffffff] dark:bg-[#161617] text-[#1d1d1f] dark:text-white transition-colors duration-200">
      {/* Left side — Branding (Apple Dark Canvas Tile) */}
      <div className="relative hidden w-1/2 lg:flex lg:flex-col lg:justify-between overflow-hidden bg-[#161617] p-12 border-r border-[#333333]">
        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 text-[21px] font-semibold text-white tracking-tight-display">
            <BookOpen className="h-6 w-6 text-[#2997ff]" />
            Research Collab
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-[40px] font-semibold leading-[1.1] tracking-tight-display text-white mb-6">
              Co-author research
              <br />
              <span className="text-[#2997ff]">at lighting speed.</span>
            </h2>
            <p className="max-w-md text-[17px] text-[#cccccc] leading-relaxed">
              Accelerate your academic publishing. Connect professors, PhD students, and external collaborators in a unified, distraction-free environment.
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
              "Interactive Kanban boards for chapters & milestones",
              "Professor-to-student task reviews & permissions",
              "Real-time team chat for writing coordination",
              "Secure document management and source links",
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3 text-[#cccccc]">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 flex-shrink-0 mt-0.5">
                  <svg className="h-3 w-3 text-[#2997ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[14px]">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-[12px] text-[#8e8e93]">
            Designed for labs and academic institutions worldwide.
          </p>
        </div>
      </div>

      {/* Right side — Form */}
      <div className="flex w-full flex-col lg:w-1/2 bg-[#ffffff] dark:bg-[#161617] transition-colors duration-200">
        {/* Top bar */}
        <div className="flex justify-between items-center p-6 sm:p-8 border-b border-[#e0e0e0] dark:border-[#333333]">
          <Link to="/" className="text-[14px] font-normal text-[#515154] dark:text-[#cccccc] hover:text-[#0066cc] dark:hover:text-[#2997ff] transition-colors flex lg:hidden items-center gap-1">
            ← Home
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
