import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Loader2, User } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useAuthStore } from "@/store/auth.store";
import { dmApi } from "@/api/dm.api";
import socketClient from "@/lib/socket";
import toast from "react-hot-toast";

export default function DMsPage() {
  const { user: currentUser } = useAuthStore();
  const { members, onlineUsers } = useWorkspaceStore();
  const [activeRecipient, setActiveRecipient] = useState<any>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // List of other collaborators (excluding current user)
  const collaborators = members
    .filter((m: any) => m.userId._id !== currentUser?._id)
    .map((m: any) => m.userId);

  useEffect(() => {
    if (activeRecipient) {
      fetchDirectMessages(activeRecipient._id);
    }
  }, [activeRecipient]);

  // Hook into socket client for real-time messages
  useEffect(() => {
    const socket = socketClient.getSocket();
    if (!socket) return;

    const handleNewDM = (message: any) => {
      // Check if message belongs to active recipient
      const isFromActive = message.senderId._id === activeRecipient?._id;
      const isToActive = message.recipientId?._id === activeRecipient?._id;
      const isSelf = message.senderId._id === currentUser?._id;

      if ((isFromActive && !isSelf) || (isToActive && isSelf) || (isSelf && isFromActive)) {
        // Prevent duplicate append
        setMessages(prev => {
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
        setTimeout(scrollToBottom, 50);
      }
    };

    socket.on("dm:new", handleNewDM);

    return () => {
      socket.off("dm:new", handleNewDM);
    };
  }, [activeRecipient, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchDirectMessages = async (recipientId: string) => {
    setIsLoadingMessages(true);
    try {
      const { data } = await dmApi.getDirectMessages(recipientId);
      setMessages(data.data.messages);
    } catch {
      toast.error("Failed to load message history");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !activeRecipient) return;

    setIsSending(true);
    const textToSend = content;
    setContent(""); // optimistic clear

    try {
      const { data } = await dmApi.sendDirectMessage(activeRecipient._id, {
        content: textToSend,
      });

      // Append immediately if not handled by socket loop yet
      setMessages(prev => {
        if (prev.some(m => m._id === data.data.message._id)) return prev;
        return [...prev, data.data.message];
      });
      setTimeout(scrollToBottom, 50);
    } catch {
      toast.error("Failed to send message");
      setContent(textToSend); // restore content
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 min-h-[70vh] bg-white dark:bg-[#161617]">
      {/* Collaborators List */}
      <div className="md:col-span-1 rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-4 shadow-apple-product flex flex-col space-y-4">
        <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-white">Collaborators</h2>
        <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[40vh] md:max-h-none">
          {collaborators.length === 0 ? (
            <p className="text-xs text-[#7a7a7a] italic text-center py-4">No other members inside laboratory.</p>
          ) : (
            collaborators.map((collab: any) => {
              const isOnline = onlineUsers.includes(collab._id);
              return (
                <button
                  key={collab._id}
                  onClick={() => setActiveRecipient(collab)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                    activeRecipient?._id === collab._id
                      ? "bg-[#0066cc]/5 border-[#0066cc] text-[#0066cc]"
                      : "bg-white dark:bg-[#161617] border-[#e0e0e0] dark:border-[#333333] hover:bg-[#f5f5f7] dark:hover:bg-[#272729]"
                  }`}
                >
                  <div className="relative">
                    <img src={collab.avatar} alt={collab.name} className="h-8 w-8 rounded-full border" />
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-xs font-semibold text-[#1d1d1f] dark:text-white truncate">{collab.name}</p>
                    <p className="text-[10px] text-[#7a7a7a] truncate mt-0.5">{isOnline ? "Active now" : "Offline"}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Conversation pane */}
      <div className="md:col-span-3 rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-5 shadow-apple-product flex flex-col h-[70vh]">
        {activeRecipient ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#e0e0e0] dark:border-[#333333]">
              <img src={activeRecipient.avatar} alt={activeRecipient.name} className="h-8 w-8 rounded-full border" />
              <div>
                <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-white">{activeRecipient.name}</h3>
                <p className="text-[10px] text-[#7a7a7a]">Private conversation</p>
              </div>
            </div>

            {/* Messages box */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {isLoadingMessages ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#0066cc]" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#7a7a7a] italic text-xs">
                  Say hello to {activeRecipient.name.split(" ")[0]}! 👋
                </div>
              ) : (
                messages.map((msg) => {
                  const isSelf = msg.senderId._id === currentUser?._id;
                  return (
                    <div key={msg._id} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                        isSelf
                          ? "bg-[#0066cc] text-white rounded-br-none"
                          : "bg-[#f5f5f7] dark:bg-[#161617] text-[#1d1d1f] dark:text-white rounded-bl-none"
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-[9px] text-right mt-1 ${isSelf ? "text-blue-200" : "text-[#7a7a7a]"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-[#e0e0e0] dark:border-[#333333]">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Message ${activeRecipient.name.split(" ")[0]}...`}
                className="flex-1 rounded-full border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617] px-4 py-2.5 text-sm text-[#1d1d1f] dark:text-white placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:bg-white dark:focus:bg-[#161617] focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={isSending || !content.trim()}
                className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white disabled:opacity-50 transition-all active-scale"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-16">
            <MessageSquare className="h-10 w-10 text-[#7a7a7a] mb-2" />
            <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white">Start a Conversation</p>
            <p className="text-xs text-[#7a7a7a] mt-0.5">Select a lab collaborator from the list on the left to start direct messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
}
