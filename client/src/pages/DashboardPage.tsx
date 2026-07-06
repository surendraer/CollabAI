import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useState } from "react";
import { aiApi } from "@/api/ai.api";
import {
  FolderKanban,
  MessageSquare,
  Clock,
  Users,
  Plus,
  ArrowRight,
  Sparkles,
  BookOpen,
  Folder,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateWorkspaceModal from "@/components/workspaces/CreateWorkspaceModal";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { labs, activeLab, workspaces, members, tasks, setWorkspaces, setActiveWorkspace } = useWorkspaceStore();
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  
  // AI Literature Review Assistant states
  const [litTopic, setLitTopic] = useState("");
  const [litResult, setLitResult] = useState("");
  const [isLitLoading, setIsLitLoading] = useState(false);

  const stats = [
    {
      label: "Research Papers",
      value: workspaces.length,
      icon: BookOpen,
      accent: "#0066cc",
      accentBg: "#e5f1ff",
    },
    {
      label: "Lab Collaborators",
      value: members.length,
      icon: Users,
      accent: "#34c759",
      accentBg: "#eafaf1",
    },
    {
      label: "Active Milestones",
      value: tasks.length,
      icon: FolderKanban,
      accent: "#ff9500",
      accentBg: "#fff5e6",
    },
  ];

  const handleRunLiteratureReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!litTopic.trim()) return;

    setIsLitLoading(true);
    setLitResult("");
    try {
      const { data } = await aiApi.getLiteratureReview(litTopic);
      setLitResult(data.data.review);
      toast.success("Literature synopsis generated!");
    } catch {
      toast.error("AI service could not process literature search.");
    } finally {
      setIsLitLoading(false);
    }
  };

  const handleOpenPaper = (ws: any) => {
    setActiveWorkspace(ws);
    // Auto navigate to files or notes if no projects exist
    navigate("/notes");
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-6 lg:p-8 shadow-apple-product"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7a7a7a] dark:text-[#cccccc] mb-1">
              {activeLab ? activeLab.name : "Research Collab"}
            </p>
            <h1 className="text-[26px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight-display">
              Welcome back, {user?.name?.split(" ")[0]}!
            </h1>
            <p className="mt-2 text-[14px] text-[#7a7a7a] dark:text-[#cccccc] max-w-xl leading-relaxed">
              {activeLab
                ? `Manage your PhD thesis workflows, co-authored papers, and lab journals under "${activeLab.name}".`
                : "Select or create a Research Laboratory from the switcher dropdown to get started."}
            </p>
          </div>
          <div className="hidden lg:flex h-12 w-12 items-center justify-center rounded-full bg-[#0066cc]/10 text-[#0066cc] flex-shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>
      </motion.div>

      {/* No Lab State */}
      {labs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[18px] border border-dashed border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#272729] py-16 text-center">
          <BookOpen className="h-10 w-10 text-[#7a7a7a] mb-2" />
          <h2 className="text-[17px] font-semibold text-[#1d1d1f] dark:text-white">Create a Laboratory</h2>
          <p className="text-xs text-[#7a7a7a] mt-0.5 max-w-xs">
            Open the top-left Laboratory Selector dropdown to create a laboratory container and start managing papers.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: stat.accentBg }}
                  >
                    <stat.icon className="h-4.5 w-4.5" style={{ color: stat.accent }} />
                  </div>
                </div>
                <p className="text-[24px] font-semibold text-[#1d1d1f] dark:text-white leading-none">{stat.value}</p>
                <p className="text-[12px] text-[#7a7a7a] dark:text-[#cccccc] mt-1.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Core Panels Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Papers List */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-6 shadow-apple-product flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-[16px] font-semibold text-[#1d1d1f] dark:text-white">Active Papers & Drafts</h2>
                    <p className="text-xs text-[#7a7a7a] mt-0.5">Academic papers currently being written by your team</p>
                  </div>
                  <button
                    onClick={() => setWorkspaceModalOpen(true)}
                    className="rounded-full bg-[#0066cc]/10 text-[#0066cc] p-1.5 hover:bg-[#0066cc]/20 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {workspaces.length === 0 ? (
                    <p className="text-xs text-[#7a7a7a] italic py-8 text-center">No research papers in progress.</p>
                  ) : (
                    workspaces.map((ws) => (
                      <div
                        key={ws._id}
                        onClick={() => handleOpenPaper(ws)}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] p-3.5 hover:border-[#0066cc] cursor-pointer transition-all active-scale"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white truncate">{ws.name}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {ws.tags?.slice(0, 3).map((tag: string) => (
                              <span key={tag} className="text-[9px] bg-white dark:bg-[#272729] text-[#7a7a7a] dark:text-[#cccccc] px-1.5 py-0.5 rounded border border-[#e0e0e0] dark:border-[#333333]">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#7a7a7a]" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>

            {/* AI Literature Review copilot */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-6 shadow-apple-product flex flex-col justify-between"
            >
              <div>
                <h2 className="text-[16px] font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-[#0066cc]" />
                  AI Literature Review Assistant
                </h2>
                <p className="text-xs text-[#7a7a7a] mt-0.5">Explore thesis bottlenecks, major methodologies, and scholar search terms</p>

                <form onSubmit={handleRunLiteratureReview} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    required
                    value={litTopic}
                    onChange={(e) => setLitTopic(e.target.value)}
                    placeholder="Enter research topic or paper abstract..."
                    className="flex-1 rounded-full border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] px-4 py-2 text-xs text-[#1d1d1f] dark:text-white placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:bg-white focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isLitLoading || !litTopic.trim()}
                    className="flex items-center gap-1 rounded-full bg-[#0066cc] hover:bg-[#0071e3] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition-all active-scale"
                  >
                    {isLitLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span>Search</span>
                    )}
                  </button>
                </form>

                <div className="mt-4">
                  {litResult ? (
                    <div className="rounded-xl border border-[#e0e0e0] dark:border-[#333333] bg-[#fafafc] dark:bg-[#161617] p-4 text-xs max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {litResult}
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center border border-dashed border-[#e0e0e0] dark:border-[#333333] rounded-xl text-[11px] text-[#7a7a7a] italic">
                      Synopsis output display.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      <CreateWorkspaceModal isOpen={workspaceModalOpen} onClose={() => setWorkspaceModalOpen(false)} />
    </div>
  );
}
