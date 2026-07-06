import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Plus, Search, SlidersHorizontal, Calendar, CheckSquare } from "lucide-react";
import { taskApi } from "@/api/task.api";
import { projectApi } from "@/api/project.api";
import { useWorkspaceStore } from "@/store/workspace.store";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import TaskDetailDrawer from "@/components/tasks/TaskDetailDrawer";
import toast from "react-hot-toast";

type TaskStatus = "todo" | "in-progress" | "done";

const COLUMNS: { id: TaskStatus; title: string; dotColor: string; bgColor: string; textColor: string }[] = [
  { id: "todo", title: "Upcoming Milestones", dotColor: "bg-[#8e8e93]", bgColor: "bg-[#f5f5f7] dark:bg-[#272729]", textColor: "text-[#1d1d1f] dark:text-white" },
  { id: "in-progress", title: "Active Research", dotColor: "bg-[#0066cc]", bgColor: "bg-[#e5f1ff] dark:bg-[#1d2d3d]", textColor: "text-[#0066cc] dark:text-[#2997ff]" },
  { id: "done", title: "Completed & Approved", dotColor: "bg-[#34c759]", bgColor: "bg-[#eafaf1] dark:bg-[#1b3d2b]", textColor: "text-[#34c759] dark:text-[#30d158]" },
];

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-[#ffdbdb] dark:bg-[#4a1c1c] text-[#ff3b30]",
  medium: "bg-[#fff5e6] dark:bg-[#4a351c] text-[#ff9500]",
  low: "bg-[#f5f5f7] dark:bg-[#272729] text-[#7a7a7a]",
};

export default function WorkspaceBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskModalDefaultStatus, setTaskModalDefaultStatus] = useState<TaskStatus>("todo");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const { activeProject, setActiveProject, tasks, setTasks, members } = useWorkspaceStore();

  useEffect(() => {
    if (projectId) loadProjectData(projectId);
  }, [projectId]);

  const loadProjectData = async (id: string) => {
    try {
      const projectRes = await projectApi.getProjectDetails(id);
      setActiveProject(projectRes.data.data.project);
      const tasksRes = await taskApi.getProjectTasks(id);
      setTasks(tasksRes.data.data.tasks);
    } catch {
      toast.error("Failed to load project board");
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDragLeave = () => setDragOverCol(null);

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;

    const taskToMove = tasks.find((t) => t._id === taskId);
    if (!taskToMove || taskToMove.status === targetStatus) return;

    const originalTasks = [...tasks];
    setTasks(tasks.map((t) => t._id === taskId ? { ...t, status: targetStatus } : t));

    try {
      await taskApi.moveTask(taskId, {
        status: targetStatus,
        targetOrder: tasks.filter((t) => t.status === targetStatus).length,
      });
    } catch {
      setTasks(originalTasks);
      toast.error("Failed to move task");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === "all" || task.assigneeId?._id === assigneeFilter;
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  return (
    <div className="flex h-full flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[11px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] px-4 py-3">
        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7a7a] pointer-events-none" />
          <input
            type="text"
            placeholder="Search milestones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] pl-9 pr-3 py-2 text-sm text-[#1d1d1f] dark:text-white placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:bg-white dark:focus:bg-[#161617] focus:outline-none transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#7a7a7a]" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#272729] px-2.5 py-1.5 text-sm text-[#1d1d1f] dark:text-white focus:border-[#0066cc] focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {members.length > 0 && (
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#272729] px-2.5 py-1.5 text-sm text-[#1d1d1f] dark:text-white focus:border-[#0066cc] focus:outline-none"
            >
              <option value="all">All Collaborators</option>
              {members.map((m) => (
                <option key={m.userId._id} value={m.userId._id}>
                  {m.userId.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => { setTaskModalDefaultStatus("todo"); setIsTaskModalOpen(true); }}
            className="flex items-center gap-1.5 rounded-full bg-[#0066cc] hover:bg-[#0071e3] px-4 py-2 text-sm font-medium text-white transition-all active-scale"
          >
            <Plus className="h-4 w-4" />
            Add Milestone
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3 items-start overflow-x-auto pb-2">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const isDragOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col rounded-[11px] border transition-colors ${
                isDragOver
                  ? "border-[#0066cc]/50 bg-[#0066cc]/5"
                  : "border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617]"
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#e0e0e0] dark:border-[#333333]">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full flex-shrink-0 ${col.dotColor}`} />
                  <span className="text-sm font-semibold text-[#1d1d1f] dark:text-white">{col.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${col.bgColor} ${col.textColor}`}>
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => { setTaskModalDefaultStatus(col.id); setIsTaskModalOpen(true); }}
                  className="rounded-md p-1 text-[#7a7a7a] hover:bg-[#e0e0e0] dark:hover:bg-[#272729] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Tasks */}
              <div
                className="flex-1 p-3 space-y-2.5 min-h-[200px] overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 18rem)" }}
              >
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#e0e0e0] dark:border-[#333333] py-8 text-center">
                    <p className="text-xs text-[#7a7a7a]">Drop milestones here</p>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      onClick={() => setSelectedTaskId(task._id)}
                      className="group cursor-grab active:cursor-grabbing rounded-[11px] border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#272729] p-4 shadow-apple-product transition-all hover:border-[#0066cc]/30 select-none"
                    >
                      {/* Title */}
                      <h4 className="text-sm font-semibold text-[#1d1d1f] dark:text-white group-hover:text-[#0066cc] dark:group-hover:text-[#2997ff] transition-colors leading-snug">
                        {task.title}
                      </h4>

                      {/* Description */}
                      {task.description && (
                        <p className="mt-1.5 text-xs text-[#7a7a7a] dark:text-[#cccccc] line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="mt-3 flex items-center justify-between gap-2 pt-2.5 border-t border-[#e0e0e0] dark:border-[#333333]">
                        <div className="flex items-center gap-2 flex-wrap">
                          {task.priority && (
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest ${PRIORITY_STYLES[task.priority] || ""}`}>
                              {task.priority}
                            </span>
                          )}
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-[11px] text-[#7a7a7a]">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                            </div>
                          )}
                          {task.subtasks?.length > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-[#7a7a7a]">
                              <CheckSquare className="h-3 w-3" />
                              <span>
                                {task.subtasks.filter((s: any) => s.isCompleted).length}/{task.subtasks.length}
                              </span>
                            </div>
                          )}
                        </div>

                        {task.assigneeId && (
                          <img
                            src={task.assigneeId.avatar}
                            alt={task.assigneeId.name}
                            className="h-6 w-6 rounded-full border-2 border-white dark:border-[#272729] flex-shrink-0"
                            title={task.assigneeId.name}
                          />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        defaultStatus={taskModalDefaultStatus}
      />

      {selectedTaskId && (
        <>
          <div className="fixed inset-0 z-40 bg-[#1d1d1f]/20" onClick={() => setSelectedTaskId(null)} />
          <TaskDetailDrawer taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
        </>
      )}
    </div>
  );
}
