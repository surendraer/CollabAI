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
      <div className="rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#272729] px-3 py-2 shadow-apple-product text-xs">
        {label && <p className="font-semibold text-[#1d1d1f] dark:text-white mb-1">{label}</p>}
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
      toast.success("AI Research summary ready!");
    } catch {
      toast.error("Failed to generate AI summary");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isLoading || !analytics) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0066cc]" />
      </div>
    );
  }

  const statusData = [
    { name: "Upcoming", value: analytics.taskStatus.todo || 0, color: "#8e8e93" },
    { name: "Active Research", value: analytics.taskStatus["in-progress"] || 0, color: "#0066cc" },
    { name: "Completed & Approved", value: analytics.taskStatus.done || 0, color: "#34c759" },
  ].filter((d) => d.value > 0);

  const workloadData = analytics.workload.map((w: any) => ({
    name: w.name.split(" ")[0],
    Milestones: w.count,
  }));

  const priorityData = [
    { name: "Low", Milestones: analytics.priority.low || 0, fill: "#8e8e93" },
    { name: "Medium", Milestones: analytics.priority.medium || 0, fill: "#ff9500" },
    { name: "High", Milestones: analytics.priority.high || 0, fill: "#ff3b30" },
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
          { label: "Total Milestones", value: totalTasks, color: "#0066cc", bg: "#e5f1ff" },
          { label: "Completed", value: analytics.taskStatus.done, color: "#34c759", bg: "#eafaf1" },
          { label: "Active", value: analytics.taskStatus["in-progress"], color: "#0066cc", bg: "#e5f1ff" },
          { label: "Completion Rate", value: `${completionRate}%`, color: "#af52de", bg: "#f6eaff" },
        ].map((s, i) => (
          <div key={i} className="rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-5 shadow-apple-product">
            <p className="text-[24px] font-semibold text-[#1d1d1f] dark:text-white leading-none">{s.value}</p>
            <p className="text-[12px] text-[#7a7a7a] dark:text-[#cccccc] mt-1.5">{s.label}</p>
            <div className="mt-3 h-1 rounded-full bg-[#f5f5f7] dark:bg-[#161617] overflow-hidden">
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
      <div className="rounded-[18px] border border-[#0066cc]/20 bg-[#0066cc]/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-semibold text-[#0066cc] dark:text-[#2997ff]">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">AI Research Milestone Report</span>
          </div>
          <p className="text-xs text-[#7a7a7a] dark:text-[#cccccc] max-w-lg leading-relaxed">
            Generate an automated paper draft summary using Google Gemini — mapping task completion, research progress, and potential thesis bottlenecks.
          </p>
          {activeProject && (
            <p className="text-xs font-semibold text-[#1d1d1f] dark:text-white">
              Paper/Project: <span className="text-[#0066cc] dark:text-[#2997ff]">{activeProject.name}</span>
            </p>
          )}
        </div>
        <button
          onClick={handleGenerateSprintSummary}
          disabled={isAiLoading}
          className="flex items-center gap-1.5 rounded-full bg-[#0066cc] hover:bg-[#0071e3] px-4 py-2.5 text-sm font-medium text-white transition-all active-scale flex-shrink-0"
        >
          {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          Generate Report
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Task Status */}
        <div className="rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-5 shadow-apple-product">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[#0066cc]" />
            <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-white">Milestone Distribution</h3>
          </div>
          <div className="h-52 flex items-center justify-center">
            {statusData.length === 0 ? (
              <p className="text-xs text-[#7a7a7a]">No research milestone data yet</p>
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
        <div className="rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-5 shadow-apple-product">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[#0066cc]" />
            <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-white">Collaborator Workload</h3>
          </div>
          <div className="h-52">
            {workloadData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-[#7a7a7a]">No active research assignments</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} barSize={28}>
                  <XAxis dataKey="name" stroke="#7a7a7a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#7a7a7a" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Milestones" fill="#0066cc" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Task Priorities */}
        <div className="rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-5 shadow-apple-product">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[#0066cc]" />
            <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-white">Milestone Priorities</h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} barSize={28}>
                <XAxis dataKey="name" stroke="#7a7a7a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#7a7a7a" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Milestones" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Progress */}
        <div className="rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-5 shadow-apple-product">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[#0066cc]" />
            <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-white">Research Project Progress</h3>
          </div>
          <div className="h-52">
            {projectProgressData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-[#7a7a7a]">No project data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectProgressData} barSize={22}>
                  <XAxis dataKey="name" stroke="#7a7a7a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#7a7a7a" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="Completed" fill="#34c759" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="Remaining" fill="#e5e5ea" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* AI Report Modal */}
      {aiReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1d1d1f]/30 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[80vh] flex flex-col rounded-[18px] border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#272729] shadow-apple-product overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#e0e0e0] dark:border-[#333333] px-6 py-4 bg-[#f5f5f7] dark:bg-[#161617] flex-shrink-0">
              <div className="flex items-center gap-2 font-semibold text-[#0066cc] dark:text-[#2997ff]">
                <Sparkles className="h-5 w-5" />
                <span>AI Research Report</span>
              </div>
              <button
                onClick={() => setAiReport(null)}
                className="rounded-full border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#272729] px-4 py-1.5 text-xs font-medium text-[#1d1d1f] dark:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#161617] transition-all active-scale"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 text-sm leading-relaxed text-[#1d1d1f] dark:text-[#cccccc] whitespace-pre-wrap bg-white dark:bg-[#161617]">
              {aiReport}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
