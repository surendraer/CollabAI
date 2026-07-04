import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useState } from "react";
import { useResendVerification } from "@/hooks/useAuth";
import {
  FolderKanban,
  MessageSquare,
  BarChart3,
  Sparkles,
  Clock,
  Users,
  Plus,
  ArrowRight,
  CheckCircle2,
  Circle,
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
      label: "Active Projects",
      value: projects.length,
      icon: FolderKanban,
      accent: "#024ad8",
      accentBg: "#c9e0fc",
    },
    {
      label: "Team Members",
      value: members.length,
      icon: Users,
      accent: "#10b981",
      accentBg: "#d1fae5",
    },
    {
      label: "Open Tasks",
      value: tasks.filter((t: any) => t.status !== "done").length,
      icon: Clock,
      accent: "#f59e0b",
      accentBg: "#fef3c7",
    },
    {
      label: "Completed",
      value: tasks.filter((t: any) => t.status === "done").length,
      icon: MessageSquare,
      accent: "#8b5cf6",
      accentBg: "#ede9fe",
    },
  ];

  const setupSteps = [
    {
      icon: FolderKanban,
      title: "Create your first project",
      desc: "Organize your work into Kanban boards with tasks and columns",
      action: () => setProjectModalOpen(true),
      btnText: "New Project",
      done: projects.length > 0,
    },
    {
      icon: Users,
      title: "Invite team members",
      desc: "Generate secure invite links from Settings to grow your team",
      action: () => navigate("/settings"),
      btnText: "Settings",
      done: members.length > 1,
    },
    {
      icon: BarChart3,
      title: "View analytics",
      desc: "Track workload, priorities, and sprint progress across your team",
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
        className="rounded-xl bg-card border border-hairline shadow-soft-lift p-6 lg:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-graphite uppercase tracking-widest mb-1">
              {activeWorkspace ? activeWorkspace.name : "CollabAI"}
            </p>
            <h1 className="text-2xl font-bold text-ink lg:text-3xl" style={{ letterSpacing: "-0.02em" }}>
              {greeting}, {user?.name?.split(" ")[0]}!
            </h1>
            <p className="mt-2 text-sm text-graphite max-w-lg">
              {activeWorkspace
                ? `You have ${projects.length} project${projects.length !== 1 ? "s" : ""} and ${tasks.filter((t: any) => t.status !== "done").length} open tasks in this workspace.`
                : "Get started by creating your first workspace to collaborate with your team."}
            </p>
          </div>
          <div className="hidden lg:flex h-12 w-12 items-center justify-center rounded-xl bg-primary/8 flex-shrink-0">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>

        {!user?.isVerified && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <div className="flex items-start gap-2.5">
              <span className="text-base flex-shrink-0">⚠️</span>
              <span>
                Please verify your email address to unlock all features. Check your inbox for a verification link.
              </span>
            </div>
            <button
              onClick={() => resendVerification()}
              disabled={isResending}
              className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-card px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100/50 disabled:opacity-50 transition-all flex-shrink-0 self-start sm:self-auto active:scale-95"
            >
              {isResending ? "Sending..." : "Resend Email"}
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
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-hairline-strong bg-card py-16 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/8 text-primary mb-4">
            <Users className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-ink">No workspace yet</h2>
          <p className="mt-2 text-sm text-graphite max-w-sm">
            Workspaces are your team's home — create one to start organizing projects, tasks, and conversations.
          </p>
          <button
            onClick={() => setWorkspaceModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-deep transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Workspace
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
                className="rounded-xl bg-card border border-hairline shadow-soft-lift p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: stat.accentBg }}
                  >
                    <stat.icon className="h-5 w-5" style={{ color: stat.accent }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-ink">{stat.value}</p>
                <p className="text-xs text-graphite mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Setup */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-xl bg-card border border-hairline shadow-soft-lift p-6"
          >
            <div className="mb-4">
              <h2 className="text-base font-bold text-ink">Getting Started</h2>
              <p className="text-sm text-graphite mt-0.5">Complete these steps to get the most out of CollabAI</p>
            </div>

            <div className="space-y-3">
              {setupSteps.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 rounded-lg border px-4 py-3.5 transition-colors ${
                    step.done
                      ? "border-emerald-100 bg-emerald-50"
                      : "border-hairline bg-cloud hover:bg-fog/50"
                  }`}
                >
                  <div>
                    {step.done ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-steel" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${step.done ? "text-emerald-700 line-through" : "text-ink"}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-graphite mt-0.5 truncate">{step.desc}</p>
                  </div>
                  {!step.done && (
                    <button
                      onClick={step.action}
                      className="flex items-center gap-1 rounded-lg border border-hairline bg-card px-3 py-1.5 text-xs font-semibold text-ink hover:border-primary hover:text-primary transition-colors flex-shrink-0"
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
              className="rounded-xl bg-card border border-hairline shadow-soft-lift p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-ink">Recent Tasks</h2>
                  <p className="text-sm text-graphite mt-0.5">Across all projects in this workspace</p>
                </div>
              </div>
              <div className="space-y-2">
                {tasks.slice(0, 5).map((task: any) => (
                  <div
                    key={task._id}
                    className="flex items-center gap-3 rounded-lg border border-hairline bg-cloud px-4 py-3 text-sm"
                  >
                    <div
                      className={`h-2 w-2 rounded-full flex-shrink-0 ${
                        task.status === "done"
                          ? "bg-emerald-400"
                          : task.status === "in-progress"
                          ? "bg-blue-400"
                          : "bg-steel"
                      }`}
                    />
                    <span className={`flex-1 font-medium ${task.status === "done" ? "line-through text-graphite" : "text-ink"}`}>
                      {task.title}
                    </span>
                    {task.priority && (
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5 ${
                          task.priority === "high"
                            ? "bg-bloom-rose text-bloom-deep"
                            : task.priority === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-cloud text-graphite"
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
