import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Users,
  MessageSquare,
  ArrowRight,
  BookOpen,
  CheckSquare,
  Award,
} from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#ffffff] text-[#1d1d1f]">
      {/* Global Navigation (Apple Global Nav chassis) */}
      <nav className="sticky top-0 z-50 w-full h-[52px] bg-[#f5f5f7]/80 dark:bg-[#161617]/80 frosted-glass border-b border-[#e0e0e0] dark:border-[#333333] transition-colors duration-200">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 sm:px-8">
          <Link to="/" className="flex items-center gap-2 text-[19px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight-display">
            <BookOpen className="h-5 w-5 text-[#0066cc]" />
            Research Collab
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to="/login"
              className="text-[14px] font-normal text-[#515154] dark:text-[#cccccc] hover:text-[#0066cc] dark:hover:text-[#2997ff] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="flex h-[32px] items-center rounded-full bg-[#0066cc] hover:bg-[#0071e3] px-4 text-[12px] font-medium text-white transition-all active-scale"
            >
              Start Free
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section — Light Tile */}
      <section className="relative overflow-hidden bg-[#ffffff] dark:bg-[#161617] py-24 sm:py-32 transition-colors duration-200 border-b border-[#e0e0e0] dark:border-[#333333]">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-[48px] sm:text-[64px] font-semibold leading-[1.07] tracking-tight-hero text-[#1d1d1f] dark:text-white mb-6">
              Research collaboration,
              <br />
              <span className="text-[#0066cc] dark:text-[#2997ff]">designed for academic rigor.</span>
            </h1>

            <p className="mx-auto max-w-2xl text-[21px] font-normal leading-[1.4] text-[#7a7a7a] dark:text-[#cccccc] mb-10">
              Co-author papers, manage Ph.D. milestones, and run discussions with students and fellow professors — all in one unified, clean workspace.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="inline-flex h-[44px] items-center justify-center rounded-full bg-[#0066cc] hover:bg-[#0071e3] px-8 text-[15px] font-medium text-white transition-all active-scale"
              >
                Create Workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="text-[17px] font-medium text-[#0066cc] dark:text-[#2997ff] hover:underline"
              >
                Sign in to your lab &rarr;
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Highlight — Dark Canvas Tile */}
      <section className="bg-[#161617] text-white py-24 sm:py-32 border-b border-[#333333]">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="text-[14px] font-semibold uppercase tracking-widest text-[#2997ff]">
                Writing & Milestones
              </div>
              <h2 className="text-[34px] sm:text-[40px] font-semibold leading-[1.1] tracking-tight-display">
                Structure your paper from abstract to peer review.
              </h2>
              <p className="text-[17px] text-[#cccccc] leading-relaxed">
                Break down research processes into clear stages. Assign literature reviews to Ph.D. candidates, schedule professor review gates, and compile drafts alongside active citation timelines.
              </p>
            </motion.div>

            {/* Interactive Card Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[#272729] rounded-[18px] border border-[#333333] p-8 shadow-apple-product space-y-6"
            >
              <div className="flex items-center justify-between border-b border-[#333333] pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                  <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                  <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-[12px] text-[#aeaeae]">Thesis_Draft_v3.pdf</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-[#161617] p-4 rounded-lg border border-[#333333]">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#2997ff]" />
                    <div>
                      <h4 className="text-[14px] font-semibold">Literature Review Chapter</h4>
                      <p className="text-[12px] text-[#aeaeae]">Assigned to: Dr. Sarah Jenkins (Ph.D. Student)</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#2997ff]/20 px-2.5 py-1 text-[11px] font-semibold text-[#2997ff]">
                    In Review
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#161617] p-4 rounded-lg border border-[#333333]">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="h-5 w-5 text-[#30d158]" />
                    <div>
                      <h4 className="text-[14px] font-semibold">Data Visualization Suite</h4>
                      <p className="text-[12px] text-[#aeaeae]">Assigned to: Prof. Marcus Vance</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#30d158]/20 px-2.5 py-1 text-[11px] font-semibold text-[#30d158]">
                    Approved
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid — Light Parchment Tile */}
      <section className="bg-[#f5f5f7] dark:bg-[#272729] py-24 sm:py-32 transition-colors duration-200 border-b border-[#e0e0e0] dark:border-[#333333]">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="text-center mb-20">
            <h2 className="text-[34px] sm:text-[40px] font-semibold leading-[1.1] tracking-tight-display mb-4 text-[#1d1d1f] dark:text-white">
              Built for scientific progress.
            </h2>
            <p className="text-[17px] text-[#7a7a7a] dark:text-[#cccccc] max-w-2xl mx-auto">
              Leave complex general-purpose project trackers behind. Focus on academic clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#ffffff] dark:bg-[#161617] rounded-[18px] border border-[#e0e0e0] dark:border-[#333333] p-8 space-y-4">
              <div className="h-10 w-10 rounded-full bg-[#0066cc]/10 flex items-center justify-center text-[#0066cc]">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#1d1d1f] dark:text-white">Lab Management</h3>
              <p className="text-[14px] text-[#7a7a7a] dark:text-[#cccccc] leading-relaxed">
                Invite postdocs, external professors, and Ph.D. students. Define granular read/write rights for different draft sections.
              </p>
            </div>
            <div className="bg-[#ffffff] dark:bg-[#161617] rounded-[18px] border border-[#e0e0e0] dark:border-[#333333] p-8 space-y-4">
              <div className="h-10 w-10 rounded-full bg-[#34c759]/10 flex items-center justify-center text-[#34c759]">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#1d1d1f] dark:text-white">Real-Time Academic Chat</h3>
              <p className="text-[14px] text-[#7a7a7a] dark:text-[#cccccc] leading-relaxed">
                Discuss figures, equations, and copy changes instantly. Channels for specific papers protect main communications.
              </p>
            </div>
            <div className="bg-[#ffffff] dark:bg-[#161617] rounded-[18px] border border-[#e0e0e0] dark:border-[#333333] p-8 space-y-4">
              <div className="h-10 w-10 rounded-full bg-[#af52de]/10 flex items-center justify-center text-[#af52de]">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#1d1d1f] dark:text-white">Milestone Tracking</h3>
              <p className="text-[14px] text-[#7a7a7a] dark:text-[#cccccc] leading-relaxed">
                Plan abstract drafts, review timelines, grant submission dates, and publication status gates with strict validation rules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section — Light Tile */}
      <section className="py-24 sm:py-32 bg-[#ffffff] dark:bg-[#161617] transition-colors duration-200">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 text-center space-y-8">
          <h2 className="text-[34px] sm:text-[40px] font-semibold tracking-tight-display text-[#1d1d1f] dark:text-white">
            Publish your next paper together.
          </h2>
          <p className="text-[17px] text-[#7a7a7a] dark:text-[#cccccc] max-w-lg mx-auto">
            Get started with Research Collab today. Organize your research lab and start collaborating with professors and students worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="inline-flex h-[44px] items-center justify-center rounded-full bg-[#0066cc] hover:bg-[#0071e3] px-8 text-[15px] font-medium text-white transition-all active-scale"
            >
              Sign Up Now
            </Link>
            <Link
              to="/login"
              className="inline-flex h-[44px] items-center justify-center rounded-full border border-[#e0e0e0] dark:border-[#333333] bg-transparent hover:bg-[#f5f5f7] dark:hover:bg-[#272729] px-8 text-[15px] font-medium text-[#1d1d1f] dark:text-white transition-all active-scale"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer — Parchment Canvas */}
      <footer className="bg-[#f5f5f7] dark:bg-[#161617] border-t border-[#e0e0e0] dark:border-[#333333] py-16 transition-colors duration-200">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-10 mb-12 text-[#515154] dark:text-[#aeaeae]">
            <div className="space-y-4">
              <h3 className="font-semibold text-[#1d1d1f] dark:text-white text-[15px]">Research Collab</h3>
              <p className="text-[13px] leading-relaxed">
                A photography-first collaboration platform engineered specifically for academic laboratories, professors, and Ph.D. students.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#1d1d1f] dark:text-white text-[13px] mb-4">Product</h4>
              <ul className="space-y-2.5 text-[13px]">
                <li><a href="#" className="hover:text-[#0066cc] transition-colors">Lab Boards</a></li>
                <li><a href="#" className="hover:text-[#0066cc] transition-colors">Chat Systems</a></li>
                <li><a href="#" className="hover:text-[#0066cc] transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#1d1d1f] dark:text-white text-[13px] mb-4">Resources</h4>
              <ul className="space-y-2.5 text-[13px]">
                <li><a href="#" className="hover:text-[#0066cc] transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-[#0066cc] transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-[#0066cc] transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#1d1d1f] dark:text-white text-[13px] mb-4">Academic Legal</h4>
              <ul className="space-y-2.5 text-[13px]">
                <li><a href="#" className="hover:text-[#0066cc] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#0066cc] transition-colors">Terms of Use</a></li>
                <li><a href="#" className="hover:text-[#0066cc] transition-colors">GDPR & FERPA</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#e0e0e0] dark:border-[#333333] pt-8 flex flex-col sm:flex-row justify-between items-center text-[12px] text-[#7a7a7a] dark:text-[#8e8e93]">
            <p>
              &copy; {new Date().getFullYear()} Research Collab. All rights reserved. Designed for academic innovation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
