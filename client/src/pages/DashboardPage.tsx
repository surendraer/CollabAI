import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";
import {
  FolderKanban,
  MessageSquare,
  BarChart3,
  Sparkles,
  Clock,
  Users,
} from "lucide-react";

const stats = [
  {
    label: "Active Projects",
    value: "0",
    icon: FolderKanban,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    label: "Team Members",
    value: "0",
    icon: Users,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Tasks Due Today",
    value: "0",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    label: "Messages",
    value: "0",
    icon: MessageSquare,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--primary)]/5 via-[var(--card)] to-[var(--card)] p-6 lg:p-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] lg:text-3xl">
              Welcome back, {user?.name?.split(" ")[0]}! 👋
            </h1>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Here's what's happening in your workspace today.
            </p>
          </div>
          <div className="hidden lg:block">
            <Sparkles className="h-8 w-8 text-[var(--primary)]" />
          </div>
        </div>

        {!user?.isVerified && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-500"
          >
            <span>⚠️</span>
            <span>
              Please verify your email to unlock all features.
              Check your inbox for a verification link.
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
                  {stat.value}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
      >
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Get started
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Complete these steps to set up your workspace
        </p>

        <div className="mt-4 space-y-3">
          {[
            {
              icon: FolderKanban,
              title: "Create your first workspace",
              desc: "Organize your team and projects",
              done: false,
            },
            {
              icon: Users,
              title: "Invite team members",
              desc: "Collaborate in real-time",
              done: false,
            },
            {
              icon: BarChart3,
              title: "Set up your first project",
              desc: "Start tracking tasks with Kanban boards",
              done: false,
            },
            {
              icon: Sparkles,
              title: "Try AI task breakdown",
              desc: "Let AI help you plan your sprint",
              done: false,
            },
          ].map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 transition-colors hover:bg-[var(--accent)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                <step.icon className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {step.title}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {step.desc}
                </p>
              </div>
              <span className="text-xs text-[var(--muted-foreground)]">
                Coming in Phase 2
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
