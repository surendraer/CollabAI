import { useState, useEffect } from "react";
import { X, Calendar, User, Tag, CheckSquare, MessageSquare, Sparkles, Loader2, Play } from "lucide-react";
import { taskApi } from "@/api/task.api";
import { aiApi } from "@/api/ai.api";
import { useWorkspaceStore } from "@/store/workspace.store";
import toast from "react-hot-toast";

interface TaskDetailDrawerProps {
  taskId: string | null;
  onClose: () => void;
}

export default function TaskDetailDrawer({ taskId, onClose }: TaskDetailDrawerProps) {
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const { activeWorkspace, activeProject, tasks, setTasks, members } = useWorkspaceStore();

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    } else {
      setTask(null);
    }
    setAiSuggestions([]);
  }, [taskId]);

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      const { data } = await taskApi.getTaskDetails(taskId);
      setTask(data.data.task);
    } catch {
      toast.error("Failed to load task details");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateField = async (fields: any) => {
    if (!task) return;
    try {
      const { data } = await taskApi.updateTask(task._id, fields);
      const updated = data.data.task;
      setTask(updated);
      
      // Update task list in store
      const updatedList = tasks.map((t) => (t._id === task._id ? { ...t, ...fields } : t));
      setTasks(updatedList);
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;

    try {
      await taskApi.addComment(task._id, { content: newComment });
      setNewComment("");
      fetchTaskDetails(); // Reload comments
    } catch {
      toast.error("Failed to post comment");
    }
  };

  const handleAddSubtask = async (titleStr: string) => {
    if (!titleStr.trim() || !task) return;
    try {
      // Since backend pushes subtasks via save, we can just save it using task update or write a custom endpoint.
      // In task.controller.ts, we toggle but don't have separate subtask add routes, so we update the array
      const updatedSubtasks = [...task.subtasks, { title: titleStr, isCompleted: false }];
      const { data } = await taskApi.updateTask(task._id, { subtasks: updatedSubtasks } as any);
      setTask(data.data.task);
      setNewSubtask("");
      
      // Sync list
      setTasks(tasks.map((t) => (t._id === task._id ? data.data.task : t)));
    } catch {
      toast.error("Failed to add subtask");
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    if (!task) return;
    try {
      const { data } = await taskApi.toggleSubtask(task._id, subtaskId);
      setTask(data.data.task);
      setTasks(tasks.map((t) => (t._id === task._id ? data.data.task : t)));
    } catch {
      toast.error("Failed to update subtask");
    }
  };

  const handleRunAiBreakdown = async () => {
    if (!task || !task.description) {
      toast.error("Add a description first to let AI analyze it.");
      return;
    }

    setIsAiLoading(true);
    try {
      const { data } = await aiApi.getTaskBreakdown(task.description);
      setAiSuggestions(data.data.subtasks);
      toast.success("AI breakdown ready!");
    } catch {
      toast.error("AI service is currently unavailable");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddAiSubtasks = async () => {
    if (aiSuggestions.length === 0 || !task) return;
    try {
      const formatted = aiSuggestions.map((title) => ({ title, isCompleted: false }));
      const updatedSubtasks = [...task.subtasks, ...formatted];
      const { data } = await taskApi.updateTask(task._id, { subtasks: updatedSubtasks } as any);
      setTask(data.data.task);
      setTasks(tasks.map((t) => (t._id === task._id ? data.data.task : t)));
      setAiSuggestions([]);
      toast.success("Subtasks added!");
    } catch {
      toast.error("Failed to apply suggestions");
    }
  };

  if (!taskId) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-[var(--border)] bg-[var(--card)] shadow-2xl">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Task details
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : task ? (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div>
            <input
              type="text"
              value={task.title}
              onChange={(e) => handleUpdateField({ title: e.target.value })}
              className="w-full border-none bg-transparent text-xl font-bold text-[var(--foreground)] focus:outline-none focus:ring-0"
            />
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-[var(--background)] p-4 text-sm border border-[var(--border)]">
            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <Tag className="h-4 w-4" />
              <span>Status</span>
            </div>
            <div>
              <select
                value={task.status}
                onChange={(e) => handleUpdateField({ status: e.target.value })}
                className="rounded border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-xs text-[var(--foreground)] focus:outline-none"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <Tag className="h-4 w-4" />
              <span>Priority</span>
            </div>
            <div>
              <select
                value={task.priority}
                onChange={(e) => handleUpdateField({ priority: e.target.value })}
                className="rounded border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-xs text-[var(--foreground)] focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <User className="h-4 w-4" />
              <span>Assignee</span>
            </div>
            <div>
              <select
                value={task.assigneeId?._id || ""}
                onChange={(e) => handleUpdateField({ assigneeId: e.target.value || null })}
                className="rounded border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-xs text-[var(--foreground)] focus:outline-none"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId._id} value={m.userId._id}>
                    {m.userId.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <Calendar className="h-4 w-4" />
              <span>Due Date</span>
            </div>
            <div>
              <input
                type="date"
                value={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
                onChange={(e) => handleUpdateField({ dueDate: e.target.value || null })}
                className="rounded border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-xs text-[var(--foreground)] focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Description
            </h3>
            <textarea
              value={task.description || ""}
              onChange={(e) => handleUpdateField({ description: e.target.value })}
              placeholder="Add details for this task..."
              rows={3}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:border-[var(--primary)] focus:outline-none resize-none"
            />
          </div>

          {/* AI Helper Panel */}
          <div className="rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                <Sparkles className="h-4.5 w-4.5" />
                <span>CollabAI Copilot</span>
              </div>
              <button
                type="button"
                onClick={handleRunAiBreakdown}
                disabled={isAiLoading}
                className="flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline disabled:opacity-50"
              >
                {isAiLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Play className="h-3 w-3 fill-current" />
                    <span>Run Task Breakdown</span>
                  </>
                )}
              </button>
            </div>

            {aiSuggestions.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-[var(--primary)]/10">
                <p className="text-xs font-medium text-[var(--foreground)]">AI Suggested Subtasks:</p>
                <ul className="space-y-1.5 text-xs text-[var(--muted-foreground)]">
                  {aiSuggestions.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span>•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={handleAddAiSubtasks}
                  className="w-full rounded-md bg-[var(--primary)] py-1.5 text-xs font-semibold text-white hover:bg-[var(--primary)]/90"
                >
                  Apply Suggested Subtasks
                </button>
              </div>
            )}
          </div>

          {/* Subtasks Checklist */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              <CheckSquare className="h-4 w-4" />
              <span>Subtasks ({task.subtasks?.filter((s: any) => s.isCompleted).length || 0}/{task.subtasks?.length || 0})</span>
            </h3>

            <div className="space-y-2">
              {task.subtasks?.map((sub: any) => (
                <div key={sub._id} className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                  <input
                    type="checkbox"
                    checked={sub.isCompleted}
                    onChange={() => handleToggleSubtask(sub._id)}
                    className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className={sub.isCompleted ? "text-[var(--muted-foreground)] line-through" : ""}>
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add subtask..."
                className="flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddSubtask(newSubtask)}
                className="rounded-md border border-[var(--border)] px-3 text-xs text-[var(--foreground)] hover:bg-[var(--accent)]"
              >
                Add
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4 pt-4 border-t border-[var(--border)]">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              <MessageSquare className="h-4 w-4" />
              <span>Comments ({task.comments?.length || 0})</span>
            </h3>

            {/* Comment Thread */}
            <div className="space-y-3">
              {task.comments?.map((comment: any) => (
                <div key={comment._id} className="flex items-start gap-2.5 text-xs">
                  <img
                    src={comment.sender.avatar}
                    alt={comment.sender.name}
                    className="h-6 w-6 rounded-full border border-[var(--border)] mt-0.5"
                  />
                  <div className="flex-1 space-y-1 bg-[var(--background)] p-2.5 rounded-lg border border-[var(--border)]">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[var(--foreground)]">{comment.sender.name}</span>
                      <span className="text-[var(--muted-foreground)] scale-90">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[var(--ink-secondary)]">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Post comment input */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type a comment..."
                className="flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="rounded-md bg-[var(--primary)] px-4 text-xs font-semibold text-white hover:bg-[var(--primary)]/90 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
