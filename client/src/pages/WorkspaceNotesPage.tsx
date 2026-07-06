import { useState, useEffect } from "react";
import { Book, Plus, Calendar, Save, Trash2, Sparkles, Loader2, FileText, CheckSquare } from "lucide-react";
import { meetingNoteApi } from "@/api/meetingNote.api";
import { aiApi } from "@/api/ai.api";
import { taskApi } from "@/api/task.api";
import { projectApi } from "@/api/project.api";
import { useWorkspaceStore } from "@/store/workspace.store";
import toast from "react-hot-toast";

export default function WorkspaceNotesPage() {
  const { activeWorkspace, meetingNotes, setMeetingNotes, projects } = useWorkspaceStore();
  const [activeNote, setActiveNote] = useState<any>(null);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<any[]>([]);

  useEffect(() => {
    if (activeWorkspace) {
      fetchNotes();
    }
  }, [activeWorkspace]);

  const fetchNotes = async () => {
    if (!activeWorkspace) return;
    try {
      const { data } = await meetingNoteApi.getMeetingNotes(activeWorkspace._id);
      const list = data.data.notes;
      setMeetingNotes(list);
      if (list.length > 0) {
        loadNoteDetails(list[0]._id);
      } else {
        setActiveNote(null);
        setTitle("");
        setContent("");
      }
    } catch {
      toast.error("Failed to load meeting notes");
    }
  };

  const loadNoteDetails = async (noteId: string) => {
    if (!activeWorkspace) return;
    try {
      const { data } = await meetingNoteApi.getMeetingNoteDetails(activeWorkspace._id, noteId);
      const note = data.data.note;
      setActiveNote(note);
      setTitle(note.title);
      setContent(note.content || "");
      setExtractedTasks([]);
    } catch {
      toast.error("Failed to load note content");
    }
  };

  const handleCreateNote = async () => {
    if (!activeWorkspace) return;
    setIsCreating(true);
    try {
      const { data } = await meetingNoteApi.createMeetingNote(activeWorkspace._id, {
        title: "Untitled Notes",
        content: "",
      });
      const newNote = data.data.note;
      setMeetingNotes([newNote, ...meetingNotes]);
      setActiveNote(newNote);
      setTitle(newNote.title);
      setContent("");
      setExtractedTasks([]);
      toast.success("New notepad created!");
    } catch {
      toast.error("Failed to create notepad");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveNote = async () => {
    if (!activeWorkspace || !activeNote) return;
    setIsSaving(true);
    try {
      const { data } = await meetingNoteApi.updateMeetingNote(activeWorkspace._id, activeNote._id, {
        title,
        content,
      });
      const updated = data.data.note;
      setActiveNote(updated);
      setMeetingNotes(meetingNotes.map(n => n._id === updated._id ? updated : n));
      toast.success("Saved successfully");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!activeWorkspace || !activeNote) return;
    if (!confirm("Are you sure you want to delete this notepad?")) return;
    try {
      await meetingNoteApi.deleteMeetingNote(activeWorkspace._id, activeNote._id);
      toast.success("Notepad deleted");
      const list = meetingNotes.filter(n => n._id !== activeNote._id);
      setMeetingNotes(list);
      if (list.length > 0) {
        loadNoteDetails(list[0]._id);
      } else {
        setActiveNote(null);
        setTitle("");
        setContent("");
      }
    } catch {
      toast.error("Failed to delete notepad");
    }
  };

  const handleAiParse = async () => {
    if (!content.trim()) {
      toast.error("Notepad content is empty.");
      return;
    }
    setIsParsing(true);
    try {
      const { data } = await aiApi.parseNotes(content);
      setExtractedTasks(data.data.tasks);
      toast.success("Extracted tasks from notes!");
    } catch {
      toast.error("Gemini failed to parse notes.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleCreateExtractedTask = async (task: any, index: number) => {
    if (!activeWorkspace || projects.length === 0) {
      toast.error("Create a Project folder first under the workspace board.");
      return;
    }
    try {
      await taskApi.createTask({
        title: task.title,
        description: task.description || "",
        projectId: projects[0]._id, // default to first project
        workspaceId: activeWorkspace._id,
        priority: "medium",
        type: "task",
      });
      toast.success(`Task created: ${task.title}`);
      setExtractedTasks(extractedTasks.filter((_, idx) => idx !== index));
    } catch {
      toast.error("Failed to create task");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 min-h-[70vh]">
      {/* Sidebar List */}
      <div className="md:col-span-1 rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-4 shadow-apple-product flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-white">Lab Journal</h2>
          <button
            onClick={handleCreateNote}
            disabled={isCreating}
            className="p-1.5 rounded-full bg-[#0066cc]/10 hover:bg-[#0066cc]/20 text-[#0066cc] transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[50vh] md:max-h-none">
          {meetingNotes.length === 0 ? (
            <p className="text-xs text-[#7a7a7a] italic text-center py-4">No lab notes yet.</p>
          ) : (
            meetingNotes.map((note) => (
              <button
                key={note._id}
                onClick={() => loadNoteDetails(note._id)}
                className={`w-full text-left p-3 rounded-xl transition-all border ${
                  activeNote?._id === note._id
                    ? "bg-[#0066cc]/5 border-[#0066cc] text-[#0066cc]"
                    : "bg-white dark:bg-[#161617] border-[#e0e0e0] dark:border-[#333333] hover:bg-[#f5f5f7] dark:hover:bg-[#272729]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs font-semibold truncate flex-1">{note.title}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#7a7a7a] mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor Pane */}
      <div className="md:col-span-3 rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-5 shadow-apple-product flex flex-col space-y-4">
        {activeNote ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e0e0e0] dark:border-[#333333]">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold text-[#1d1d1f] dark:text-white bg-transparent border-b border-transparent focus:border-[#0066cc] focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAiParse}
                  disabled={isParsing}
                  className="flex items-center gap-1 rounded-full border border-[#0066cc]/20 bg-[#0066cc]/5 px-3 py-1.5 text-xs font-semibold text-[#0066cc] hover:bg-[#0066cc]/10 disabled:opacity-50 transition-all active-scale"
                >
                  {isParsing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Parse Tasks
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={isSaving}
                  className="flex items-center gap-1 rounded-full bg-[#0066cc] hover:bg-[#0071e3] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50 transition-all active-scale"
                >
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save
                </button>
                <button
                  onClick={handleDeleteNote}
                  className="p-2 rounded-full border border-[#ff3b30]/20 bg-[#ff3b30]/5 text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* AI Extracted Tasks Bar */}
            {extractedTasks.length > 0 && (
              <div className="rounded-xl border border-[#0066cc]/20 bg-[#0066cc]/5 p-4 space-y-2">
                <p className="text-xs font-semibold text-[#0066cc] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Gemini AI Extracted Milestones:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {extractedTasks.map((task, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 bg-white dark:bg-[#161617] border border-[#e0e0e0] dark:border-[#333333] p-2.5 rounded-lg text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#1d1d1f] dark:text-white truncate">{task.title}</p>
                        <p className="text-[10px] text-[#7a7a7a] truncate mt-0.5">{task.description}</p>
                      </div>
                      <button
                        onClick={() => handleCreateExtractedTask(task, idx)}
                        className="p-1 rounded-full hover:bg-[#f5f5f7] dark:hover:bg-[#272729] text-[#0066cc]"
                        title="Add to board"
                      >
                        <CheckSquare className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 h-[50vh]">
              {/* Write Mode */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your research drafts or meeting notes here using Markdown..."
                className="w-full h-full p-4 rounded-xl border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] text-sm text-[#1d1d1f] dark:text-white placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:bg-white dark:focus:bg-[#161617] focus:outline-none resize-none"
              />

              {/* Preview Mode */}
              <div className="p-4 rounded-xl border border-[#e0e0e0] dark:border-[#333333] bg-[#fafafc] dark:bg-[#161617] overflow-y-auto text-sm text-[#1d1d1f] dark:text-[#cccccc] prose dark:prose-invert">
                {content.trim() ? (
                  <div className="space-y-2 whitespace-pre-wrap">
                    {content}
                  </div>
                ) : (
                  <p className="text-xs text-[#7a7a7a] italic">Live preview area.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-16 text-center">
            <Book className="h-10 w-10 text-[#7a7a7a] mb-2" />
            <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white">No active notepad</p>
            <p className="text-xs text-[#7a7a7a] mt-0.5">Click the plus button in the sidebar to start a new notepad.</p>
          </div>
        )}
      </div>
    </div>
  );
}
