import { useState, useEffect, useRef } from "react";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { chatApi } from "@/api/chat.api";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useAuthStore } from "@/store/auth.store";
import socketClient from "@/lib/socket";
import { isPusherConfigured, subscribeToChatChannel } from "@/lib/pusher";
import toast from "react-hot-toast";

export default function WorkspaceChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { activeWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (activeWorkspace) loadMessages(activeWorkspace._id);
  }, [activeWorkspace]);

  useEffect(() => {
    if (!activeWorkspace) return;

    const addMessage = (data: { message: any }) => {
      if (data.message.workspaceId === activeWorkspace._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
      }
    };

    let cleanup: (() => void) | undefined;

    if (isPusherConfigured()) {
      // Use Pusher — works across all environments, no cookie issues
      cleanup = subscribeToChatChannel(activeWorkspace._id, addMessage);
    } else {
      // Fallback: Socket.IO listener
      const socket = socketClient.getSocket();
      if (socket) {
        socket.on("chat:message", addMessage);
        cleanup = () => socket.off("chat:message", addMessage);
      }
    }

    return () => { if (cleanup) cleanup(); };
  }, [activeWorkspace]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async (workspaceId: string) => {
    setIsLoading(true);
    try {
      const { data } = await chatApi.getWorkspaceMessages(workspaceId);
      setMessages(data.data.messages);
    } catch {
      toast.error("Failed to load chat history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeWorkspace) return;
    setIsSending(true);
    try {
      const { data } = await chatApi.sendMessage(activeWorkspace._id, { content: newMsg });
      const sentMessage = data.data.message;
      if (sentMessage) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === sentMessage._id)) return prev;
          return [...prev, sentMessage];
        });
      }
      setNewMsg("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-xl border border-hairline bg-card shadow-soft-lift overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-hairline px-5 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8">
          <MessageCircle className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink">
            #{activeWorkspace?.name?.toLowerCase().replace(/\s+/g, "-") || "general"}
          </h2>
          <p className="text-[11px] text-graphite">Team workspace chat</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-cloud">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/8">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-semibold text-ink">No messages yet</p>
            <p className="text-xs text-graphite">Start the conversation with your team!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.sender._id === user?._id;
            const prevMsg = messages[idx - 1];
            const isSameAuthor = prevMsg && prevMsg.sender._id === msg.sender._id;

            return (
              <div
                key={msg._id}
                className={`flex items-end gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}
              >
                {!isOwn && (
                  <img
                    src={msg.sender.avatar}
                    alt={msg.sender.name}
                    className={`h-7 w-7 rounded-full border border-hairline flex-shrink-0 ${isSameAuthor ? "opacity-0" : ""}`}
                  />
                )}
                <div className={`group flex flex-col max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                  {!isOwn && !isSameAuthor && (
                    <span className="text-[11px] font-semibold text-charcoal mb-1 px-1">
                      {msg.sender.name}
                    </span>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words ${
                      isOwn
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-card border border-hairline text-ink rounded-bl-sm shadow-soft-lift"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-graphite mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-hairline bg-card px-4 py-3">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            disabled={isLoading || isSending}
            placeholder={`Message #${activeWorkspace?.name || "workspace"}...`}
            className="flex-1 rounded-xl border border-hairline bg-cloud px-4 py-2.5 text-sm text-ink placeholder:text-graphite focus:border-primary focus:bg-card focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!newMsg.trim() || isSending}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-deep disabled:opacity-40 transition-colors flex-shrink-0"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
