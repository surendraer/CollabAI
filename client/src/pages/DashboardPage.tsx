import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useState } from "react";
import { useResendVerification } from "@/hooks/useAuth";
import {
  FolderKanban,
  MessageSquare,
  BarChart3,
  Clock,
  Users,
  Plus,
  ArrowRight,
  CheckCircle2,
  Circle,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateWorkspaceModal from "@/components/workspaces/CreateWorkspaceModal";
import CreateProjectModal from "@/components/projects/CreateProjectModal";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { workspaces, activeWorkspace, projects, members, tasks } = useWorkspaceStore();
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  
  const { mutate: resendVerification, isPending: isResending } = useResendVerification();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const stats = [
    {
      label: "Research Projects",
      value: projects.length,
      icon: FolderKanban,
      accent: "#0066cc",
      accentBg: "#e5f1ff",
    },
    {
      label: "Co-authors & Students",
      value: members.length,
      icon: Users,
      accent: "#34c759",
      accentBg: "#eafaf1",
    },
    {
      label: "Pending Tasks",
      value: tasks.filter((t: any) => t.status !== "done").length,
      icon: Clock,
      accent: "#ff9500",
      accentBg: "#fff5e6",
    },
    {
      label: "Completed Milestones",
      value: tasks.filter((t: any) => t.status === "done").length,
      icon: MessageSquare,
      accent: "#af52de",
      accentBg: "#f6eaff",
    },
  ];

  const setupSteps = [
    {
      icon: FolderKanban,
      title: "Set up a new paper or grant proposal",
      desc: "Organize drafts, methodologies, and peer review tracking into distinct project boards",
      action: () => setProjectModalOpen(true),
      btnText: "Create Project",
      done: projects.length > 0,
    },
    {
      icon: Users,
      title: "Invite PhD students & co-authors",
      desc: "Send a secure invite link to add researchers or students to your lab",
      action: () => navigate("/settings"),
      btnText: "Lab Settings",
      done: members.length > 1,
    },
    {
      icon: BarChart3,
      title: "Assess review timelines",
      desc: "Keep track of task assignments, abstract submissions, and thesis gates",
      action: () => navigate("/analytics"),
      btnText: "Analytics",
      done: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-6 lg:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7a7a7a] dark:text-[#cccccc] mb-1">
              {activeWorkspace ? activeWorkspace.name : "Research Collab"}
            </p>
            <h1 className="text-[28px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight-display">
              {greeting}, {user?.name?.split(" ")[0]}!
            </h1>
            <p className="mt-2 text-[14px] text-[#7a7a7a] dark:text-[#cccccc] max-w-lg leading-relaxed">
              {activeWorkspace
                ? `Your laboratory has ${projects.length} active project${projects.length !== 1 ? "s" : ""} and ${tasks.filter((t: any) => t.status !== "done").length} open tasks.`
                : "Initialize your first laboratory workspace to start co-authoring papers and tracking academic progress."}
            </p>
          </div>
          <div className="hidden lg:flex h-12 w-12 items-center justify-center rounded-full bg-[#0066cc]/10 text-[#0066cc] flex-shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        {!user?.isVerified && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[11px] border border-[#ffdbdb] bg-[#ffdbdb]/20 px-4 py-3 text-sm text-[#ff3b30]">
            <div className="flex items-start gap-2.5">
              <span className="text-base flex-shrink-0">⚠️</span>
              <span className="text-[13px]">
                Please verify your email address to unlock full academic permissions. Check your inbox for the link.
              </span>
            </div>
            <button
              onClick={() => resendVerification()}
              disabled={isResending}
              className="inline-flex items-center justify-center rounded-full border border-[#ff3b30]/30 bg-white dark:bg-[#161617] px-4 py-1 text-[11px] font-medium text-[#ff3b30] hover:bg-[#ff3b30]/5 disabled:opacity-50 transition-all active-scale"
            >
              {isResending ? "Resending..." : "Resend Email"}
            </button>
          </div>
        )}
      </motion.div>

      {/* No Workspace State */}
      {workspaces.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center rounded-[18px] border border-dashed border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#272729] py-16 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0066cc]/10 text-[#0066cc] mb-4">
            <BookOpen className="h-7 w-7" />
          </div>
          <h2 className="text-[19px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight-display">No research laboratory found</h2>
          <p className="mt-2 text-[14px] text-[#7a7a7a] dark:text-[#cccccc] max-w-sm">
            Laboratories host your research teams, write discussions, papers, and PhD project boards. Create one to get started.
          </p>
          <button
            onClick={() => setWorkspaceModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0066cc] hover:bg-[#0071e3] px-6 py-2.5 text-sm font-medium text-white transition-all active-scale"
          >
            <Plus className="h-4 w-4" />
            Create Laboratory
          </button>
        </motion.div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-5 shadow-apple-product"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: stat.accentBg }}
                  >
                    <stat.icon className="h-5 w-5" style={{ color: stat.accent }} />
                  </div>
                </div>
                <p className="text-[24px] font-semibold text-[#1d1d1f] dark:text-white leading-none">{stat.value}</p>
                <p className="text-[12px] text-[#7a7a7a] dark:text-[#cccccc] mt-1.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Setup */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-6 shadow-apple-product"
          >
            <div className="mb-4">
              <h2 className="text-[17px] font-semibold text-[#1d1d1f] dark:text-white">Getting Started</h2>
              <p className="text-[14px] text-[#7a7a7a] dark:text-[#cccccc] mt-0.5">Complete these setup steps to launch your laboratory workspace</p>
            </div>

            <div className="space-y-3">
              {setupSteps.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 rounded-[11px] border px-4 py-3.5 transition-colors ${
                    step.done
                      ? "border-emerald-100 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20"
                      : "border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617]"
                  }`}
                >
                  <div>
                    {step.done ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-[#8e8e93]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-semibold ${step.done ? "text-emerald-700 dark:text-emerald-400 line-through" : "text-[#1d1d1f] dark:text-white"}`}>
                      {step.title}
                    </p>
                    <p className="text-[12px] text-[#7a7a7a] dark:text-[#cccccc] mt-0.5 truncate leading-relaxed">{step.desc}</p>
                  </div>
                  {!step.done && (
                    <button
                      onClick={step.action}
                      className="flex items-center gap-1 rounded-full border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#272729] px-3.5 py-1.5 text-[12px] font-medium text-[#1d1d1f] dark:text-white hover:border-[#0066cc] hover:text-[#0066cc] transition-colors flex-shrink-0 active-scale"
                    >
                      {step.btnText}
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Tasks */}
          {tasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-6 shadow-apple-product"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[17px] font-semibold text-[#1d1d1f] dark:text-white">Recent Research Milestones</h2>
                  <p className="text-[14px] text-[#7a7a7a] dark:text-[#cccccc] mt-0.5">Across all papers in this laboratory</p>
                </div>
              </div>
              <div className="space-y-2">
                {tasks.slice(0, 5).map((task: any) => (
                  <div
                    key={task._id}
                    className="flex items-center gap-3 rounded-[11px] border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] px-4 py-3 text-sm"
                  >
                    <div
                      className={`h-2 w-2 rounded-full flex-shrink-0 ${
                        task.status === "done"
                          ? "bg-[#34c759]"
                          : task.status === "in-progress"
                          ? "bg-[#0066cc]"
                          : "bg-[#8e8e93]"
                      }`}
                    />
                    <span className={`flex-1 font-medium text-[14px] ${task.status === "done" ? "line-through text-[#7a7a7a]" : "text-[#1d1d1f] dark:text-white"}`}>
                      {task.title}
                    </span>
                    {task.priority && (
                      <span
                        className={`text-[9px] font-semibold uppercase tracking-widest rounded-full px-2.5 py-0.5 ${
                          task.priority === "high"
                            ? "bg-[#ffdbdb] dark:bg-[#4a1c1c] text-[#ff3b30]"
                            : task.priority === "medium"
                            ? "bg-[#fff5e6] dark:bg-[#4a351c] text-[#ff9500]"
                            : "bg-[#f5f5f7] dark:bg-[#272729] text-[#7a7a7a]"
                        }`}
                      >
                        {task.priority}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}

      <CreateWorkspaceModal isOpen={workspaceModalOpen} onClose={() => setWorkspaceModalOpen(false)} />
      <CreateProjectModal isOpen={projectModalOpen} onClose={() => setProjectModalOpen(false)} />
    </div>
  );
}
