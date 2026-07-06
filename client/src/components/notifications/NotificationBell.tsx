import { useState, useEffect, useRef } from "react";
import { Bell, Check, Eye } from "lucide-react";
import { notificationApi } from "@/api/notification.api";
import { useNotificationStore } from "@/store/notification.store";
import toast from "react-hot-toast";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, setNotifications, markRead, markAllRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();

    // Close on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationApi.getNotifications();
      setNotifications(data.data.notifications);
    } catch {
      // Fail silently
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      markRead(id);
    } catch {
      toast.error("Failed to update notification");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      markAllRead();
      toast.success("All notifications read");
    } catch {
      toast.error("Failed to update notifications");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#272729] text-[#1d1d1f] dark:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#161617] transition-all active-scale"
        aria-label="View notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff3b30] text-[9px] font-bold text-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-80 rounded-xl border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#272729] p-2 shadow-apple-product animate-in fade-in duration-100">
          <div className="flex items-center justify-between border-b border-[#e0e0e0] dark:border-[#333333] pb-2 px-2">
            <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-semibold text-[#0066cc] hover:underline flex items-center gap-0.5"
              >
                <Check className="h-3 w-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="mt-1 max-h-64 overflow-y-auto space-y-1">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#7a7a7a]">
                All caught up! ☕
              </div>
            ) : (
              notifications.map((notification) => {
                const isRead = notification.isRead || notification.read;
                const actor = notification.actorId || notification.sender;
                return (
                  <div
                    key={notification._id}
                    className={`flex items-start gap-2.5 rounded-lg p-2 transition-colors ${
                      isRead ? "opacity-60" : "bg-[#0066cc]/5 hover:bg-[#0066cc]/10"
                    }`}
                  >
                    <img
                      src={actor?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=Sys`}
                      alt="Actor"
                      className="h-6 w-6 rounded-full border border-[#e0e0e0] dark:border-[#333333] mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1d1d1f] dark:text-white truncate">
                        {notification.type.replace("_", " ").toUpperCase()}
                      </p>
                      <p className="text-[10px] text-[#7a7a7a] dark:text-[#cccccc] leading-snug">
                        {notification.message}
                      </p>
                    </div>
                    {!isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="rounded-full p-1 text-[#7a7a7a] hover:bg-[#e0e0e0] dark:hover:bg-[#161617] hover:text-[#0066cc] transition-colors flex-shrink-0"
                        title="Mark as read"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
