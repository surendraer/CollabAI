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
  { id: "todo", title: "To Do", dotColor: "bg-steel", bgColor: "bg-cloud", textColor: "text-charcoal" },
  { id: "in-progress", title: "In Progress", dotColor: "bg-blue-400", bgColor: "bg-blue-50", textColor: "text-blue-700" },
  { id: "done", title: "Done", dotColor: "bg-emerald-400", bgColor: "bg-emerald-50", textColor: "text-emerald-700" },
];

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-bloom-rose text-bloom-deep",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-cloud text-graphite",
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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card border border-hairline shadow-soft-lift px-4 py-3">
        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-hairline bg-cloud pl-9 pr-3 py-2 text-sm text-ink placeholder:text-graphite focus:border-primary focus:bg-card focus:outline-none transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm">
            <SlidersHorizontal className="h-3.5 w-3.5 text-graphite" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-hairline bg-card px-2.5 py-1.5 text-sm text-ink focus:border-primary focus:outline-none"
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
              className="rounded-lg border border-hairline bg-card px-2.5 py-1.5 text-sm text-ink focus:border-primary focus:outline-none"
            >
              <option value="all">All Members</option>
              {members.map((m) => (
                <option key={m.userId._id} value={m.userId._id}>
                  {m.userId.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => { setTaskModalDefaultStatus("todo"); setIsTaskModalOpen(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-deep transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Task
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
              className={`flex flex-col rounded-xl border transition-colors ${
                isDragOver
                  ? "border-primary/50 bg-primary/3"
                  : "border-hairline bg-cloud"
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-hairline">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full flex-shrink-0 ${col.dotColor}`} />
                  <span className="text-sm font-bold text-ink">{col.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${col.bgColor} ${col.textColor}`}>
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => { setTaskModalDefaultStatus(col.id); setIsTaskModalOpen(true); }}
                  className="rounded-md p-1 text-graphite hover:bg-fog hover:text-ink transition-colors"
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
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline-strong py-8 text-center">
                    <p className="text-xs text-graphite">Drop tasks here</p>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      onClick={() => setSelectedTaskId(task._id)}
                      className="group cursor-grab active:cursor-grabbing rounded-xl border border-hairline bg-card p-4 shadow-soft-lift transition-all hover:shadow-card-hover hover:border-primary/30 select-none"
                    >
                      {/* Title */}
                      <h4 className="text-sm font-semibold text-ink group-hover:text-primary transition-colors leading-snug">
                        {task.title}
                      </h4>

                      {/* Description */}
                      {task.description && (
                        <p className="mt-1.5 text-xs text-graphite line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="mt-3 flex items-center justify-between gap-2 pt-2.5 border-t border-hairline">
                        <div className="flex items-center gap-2 flex-wrap">
                          {task.priority && (
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${PRIORITY_STYLES[task.priority] || ""}`}>
                              {task.priority}
                            </span>
                          )}
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-[11px] text-graphite">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                            </div>
                          )}
                          {task.subtasks?.length > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-graphite">
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
                            className="h-6 w-6 rounded-full border-2 border-white shadow-soft-lift flex-shrink-0"
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
          <div className="fixed inset-0 z-40 bg-ink/20" onClick={() => setSelectedTaskId(null)} />
          <TaskDetailDrawer taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
        </>
      )}
    </div>
  );
}
