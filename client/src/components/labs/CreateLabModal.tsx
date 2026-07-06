import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { labApi } from "@/api/lab.api";
import { useWorkspaceStore } from "@/store/workspace.store";
import toast from "react-hot-toast";

interface CreateLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateLabModal({ isOpen, onClose }: CreateLabModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [institution, setInstitution] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { labs, setLabs, setActiveLab } = useWorkspaceStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const { data } = await labApi.createLab({ name, description, institution });
      const newLab = data.data.lab;
      
      // Update labs in store
      setLabs([...labs, { ...newLab, role: "owner" }]);
      setActiveLab(newLab);
      
      toast.success("Laboratory created successfully! 🧪");
      setName("");
      setDescription("");
      setInstitution("");
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create lab");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[18px] border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#272729] p-6 shadow-apple-product">
        <div className="flex items-center justify-between border-b border-[#e0e0e0] dark:border-[#333333] pb-4">
          <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">Create Laboratory</h2>
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
              Laboratory Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Natural Language Processing Lab"
              className="mt-1.5 w-full rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] px-3 py-2.5 text-sm text-[#1d1d1f] dark:text-white placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:bg-white dark:focus:bg-[#161617] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#7a7a7a] dark:text-[#cccccc]">
              Institution (Optional)
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. Stanford University"
              className="mt-1.5 w-full rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] px-3 py-2.5 text-sm text-[#1d1d1f] dark:text-white placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:bg-white dark:focus:bg-[#161617] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#7a7a7a] dark:text-[#cccccc]">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What research focuses does this laboratory concentrate on?"
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] px-3 py-2.5 text-sm text-[#1d1d1f] dark:text-white placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:bg-white dark:focus:bg-[#161617] focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#272729] px-5 py-2 text-sm font-semibold text-[#1d1d1f] dark:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#161617] transition-all active-scale"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex items-center gap-1.5 rounded-full bg-[#0066cc] hover:bg-[#0071e3] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 transition-all active-scale"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Lab
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
