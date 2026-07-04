import { useState, useEffect } from "react";
import { Loader2, Sparkles, FileText, TrendingUp } from "lucide-react";
import { analyticsApi } from "@/api/analytics.api";
import { aiApi } from "@/api/ai.api";
import { useWorkspaceStore } from "@/store/workspace.store";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import toast from "react-hot-toast";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-hairline bg-card px-3 py-2 shadow-floating-modal text-xs">
        {label && <p className="font-semibold text-ink mb-1">{label}</p>}
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color || p.fill }} className="font-medium">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function WorkspaceAnalyticsPage() {
  const { activeWorkspace, activeProject } = useWorkspaceStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (activeWorkspace) fetchAnalytics(activeWorkspace._id);
  }, [activeWorkspace]);

  const fetchAnalytics = async (workspaceId: string) => {
    setIsLoading(true);
    try {
      const { data } = await analyticsApi.getWorkspaceAnalytics(workspaceId);
      setAnalytics(data.data);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSprintSummary = async () => {
    if (!activeProject) {
      toast.error("Select a project from the sidebar first.");
      return;
    }
    setIsAiLoading(true);
    try {
      const { data } = await aiApi.getSprintSummary(activeProject._id);
      setAiReport(data.data.summary);
      toast.success("AI Sprint summary ready!");
    } catch {
      toast.error("Failed to generate AI summary");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isLoading || !analytics) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusData = [
    { name: "To Do", value: analytics.taskStatus.todo || 0, color: "#9ca3af" },
    { name: "In Progress", value: analytics.taskStatus["in-progress"] || 0, color: "#3b82f6" },
    { name: "Done", value: analytics.taskStatus.done || 0, color: "#10b981" },
  ].filter((d) => d.value > 0);

  const workloadData = analytics.workload.map((w: any) => ({
    name: w.name.split(" ")[0],
    Tasks: w.count,
  }));

  const priorityData = [
    { name: "Low", Tasks: analytics.priority.low || 0, fill: "#9ca3af" },
    { name: "Medium", Tasks: analytics.priority.medium || 0, fill: "#f59e0b" },
    { name: "High", Tasks: analytics.priority.high || 0, fill: "#ef4444" },
  ];

  const projectProgressData = analytics.projects.map((p: any) => ({
    name: p.name.length > 10 ? p.name.slice(0, 10) + "…" : p.name,
    Completed: p.completed,
    Remaining: p.total - p.completed,
  }));

  const totalTasks = analytics.taskStatus.todo + analytics.taskStatus["in-progress"] + analytics.taskStatus.done || 0;
  const completionRate = totalTasks > 0 ? Math.round((analytics.taskStatus.done / totalTasks) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Tasks", value: totalTasks, color: "#024ad8", bg: "#c9e0fc" },
          { label: "Completed", value: analytics.taskStatus.done, color: "#10b981", bg: "#d1fae5" },
          { label: "In Progress", value: analytics.taskStatus["in-progress"], color: "#3b82f6", bg: "#dbeafe" },
          { label: "Completion Rate", value: `${completionRate}%`, color: "#8b5cf6", bg: "#ede9fe" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl bg-card border border-hairline shadow-soft-lift p-5">
            <p className="text-2xl font-bold text-ink">{s.value}</p>
            <p className="text-xs text-graphite mt-0.5">{s.label}</p>
            <div className="mt-3 h-1.5 rounded-full bg-cloud overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: s.color,
                  width: typeof s.value === "string" ? s.value : `${Math.min((s.value / Math.max(totalTasks, 1)) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* AI Sprint Summary */}
      <div className="rounded-xl border border-primary/20 bg-primary/4 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">AI Sprint Report</span>
          </div>
          <p className="text-xs text-graphite max-w-lg">
            Generate an automated sprint summary using Google Gemini — covering task status, team workload, priorities, and blockers.
          </p>
          {activeProject && (
            <p className="text-xs font-semibold text-ink">
              Project: <span className="text-primary">{activeProject.name}</span>
            </p>
          )}
        </div>
        <button
          onClick={handleGenerateSprintSummary}
          disabled={isAiLoading}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-50 transition-colors flex-shrink-0"
        >
          {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          Generate Summary
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Task Status */}
        <div className="rounded-xl bg-card border border-hairline shadow-soft-lift p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-ink">Task Status Distribution</h3>
          </div>
          <div className="h-52 flex items-center justify-center">
            {statusData.length === 0 ? (
              <p className="text-xs text-graphite">No task data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="45%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Team Workload */}
        <div className="rounded-xl bg-card border border-hairline shadow-soft-lift p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-ink">Team Workload</h3>
          </div>
          <div className="h-52">
            {workloadData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-graphite">No active tasks assigned</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} barSize={28}>
                  <XAxis dataKey="name" stroke="#636363" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#636363" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Tasks" fill="#024ad8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Task Priorities */}
        <div className="rounded-xl bg-card border border-hairline shadow-soft-lift p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-ink">Task Priorities</h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} barSize={28}>
                <XAxis dataKey="name" stroke="#636363" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#636363" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Tasks" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Progress */}
        <div className="rounded-xl bg-card border border-hairline shadow-soft-lift p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-ink">Project Progress</h3>
          </div>
          <div className="h-52">
            {projectProgressData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-graphite">No project data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectProgressData} barSize={22}>
                  <XAxis dataKey="name" stroke="#636363" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#636363" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="Remaining" fill="#e8e8e8" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* AI Report Modal */}
      {aiReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30">
          <div className="w-full max-w-2xl max-h-[80vh] flex flex-col rounded-xl border border-hairline bg-card shadow-floating-modal overflow-hidden">
            <div className="flex items-center justify-between border-b border-hairline px-6 py-4 flex-shrink-0">
              <div className="flex items-center gap-2 font-bold text-primary">
                <Sparkles className="h-5 w-5" />
                <span>AI Sprint Report</span>
              </div>
              <button
                onClick={() => setAiReport(null)}
                className="rounded-lg border border-hairline bg-cloud px-3 py-1.5 text-xs font-semibold text-ink hover:bg-fog transition-colors"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 text-sm leading-relaxed text-charcoal whitespace-pre-wrap bg-cloud rounded-b-xl">
              {aiReport}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
