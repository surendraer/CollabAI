import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { taskApi } from "@/api/task.api";
import { useWorkspaceStore } from "@/store/workspace.store";
import toast from "react-hot-toast";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStageId?: string;
}

export default function CreateTaskModal({ isOpen, onClose, defaultStageId }: CreateTaskModalProps) {
  const { activeWorkspace, activeProject, tasks, setTasks, pipelineStages, members } = useWorkspaceStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [stageId, setStageId] = useState(defaultStageId || (pipelineStages.length > 0 ? pipelineStages[0]._id : ""));
  const [type, setType] = useState<"task" | "milestone">("task");
  const [dueDate, setDueDate] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activeWorkspace || !activeProject) return;

    setIsLoading(true);
    try {
      const labels = labelInput.split(",").map(t => t.trim()).filter(Boolean);

      const { data } = await taskApi.createTask({
        title,
        description,
        projectId: activeProject._id,
        workspaceId: activeWorkspace._id,
        assigneeIds: selectedAssignees,
        priority,
        stageId,
        type,
        dueDate: dueDate || undefined,
        reminderAt: reminderAt || undefined,
        labels,
      } as any);

      // Fetch details to ensure assignees/etc are populated
      const detailRes = await taskApi.getTaskDetails(data.data.task._id);
      setTasks([...tasks, detailRes.data.data.task]);
      
      toast.success("Milestone card added! 🎉");
      setTitle("");
      setDescription("");
      setSelectedAssignees([]);
      setPriority("medium");
      setType("task");
      setDueDate("");
      setReminderAt("");
      setLabelInput("");
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssigneeToggle = (userId: string) => {
    setSelectedAssignees(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[18px] border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#272729] p-6 shadow-apple-product">
        <div className="flex items-center justify-between border-b border-[#e0e0e0] dark:border-[#333333] pb-4">
          <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">New Milestone Card</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[#7a7a7a] hover:bg-[#f5f5f7] dark:hover:bg-[#161617] hover:text-[#1d1d1f]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#7a7a7a] dark:text-[#cccccc]">
              Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs co-authoring or review?"
              className="mt-1.5 w-full rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] px-3 py-2.5 text-sm text-[#1d1d1f] dark:text-white focus:border-[#0066cc] focus:bg-white dark:focus:bg-[#161617] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#7a7a7a] dark:text-[#cccccc]">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Thesis chapter drafts, dataset references, or reviewer feedback comments..."
              rows={2}
              className="mt-1.5 w-full rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] px-3 py-2.5 text-sm text-[#1d1d1f] dark:text-white focus:border-[#0066cc] focus:bg-white dark:focus:bg-[#161617] focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#7a7a7a] dark:text-[#cccccc]">
                Milestone Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="mt-1.5 w-full rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] px-3 py-2.5 text-sm text-[#1d1d1f] dark:text-white focus:outline-none"
              >
                <option value="task">Sub-Task</option>
                <option value="milestone">Key Milestone</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#7a7a7a] dark:text-[#cccccc]">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="mt-1.5 w-full rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] px-3 py-2.5 text-sm text-[#1d1d1f] dark:text-white focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#7a7a7a] dark:text-[#cccccc]">
                Placement Column
              </label>
              <select
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] px-3 py-2.5 text-sm text-[#1d1d1f] dark:text-white focus:outline-none"
              >
                {pipelineStages.map((stage) => (
                  <option key={stage._id} value={stage._id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#7a7a7a] dark:text-[#cccccc]">
                Labels (comma sep)
              </label>
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="e.g. drafting, review"
                className="mt-1.5 w-full rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] px-3 py-2.5 text-sm text-[#1d1d1f] dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#7a7a7a] dark:text-[#cccccc]">
              Collaborators Assigned
            </label>
            <div className="mt-1.5 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto border border-[#e0e0e0] dark:border-[#333333] p-2 rounded-lg bg-[#f5f5f7] dark:bg-[#161617]">
              {members.map((m) => {
                const isSelected = selectedAssignees.includes(m.userId._id);
                return (
                  <button
                    key={m.userId._id}
                    type="button"
                    onClick={() => handleAssigneeToggle(m.userId._id)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#0066cc] text-white"
                        : "bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] text-[#1d1d1f] dark:text-white hover:bg-[#fafafc]"
                    }`}
                  >
                    {m.userId.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#7a7a7a] dark:text-[#cccccc]">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] px-3 py-2 text-sm text-[#1d1d1f] dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#7a7a7a] dark:text-[#cccccc]">
                Reminder Date (Optional)
              </label>
              <input
                type="date"
                value={reminderAt}
                onChange={(e) => setReminderAt(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] px-3 py-2 text-sm text-[#1d1d1f] dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#272729] px-5 py-2 text-sm font-semibold text-[#1d1d1f] dark:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#161617] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="flex items-center gap-1.5 rounded-full bg-[#0066cc] hover:bg-[#0071e3] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 transition-all"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
