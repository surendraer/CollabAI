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
      // Fail silently for dashboard shell polish
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
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
        aria-label="View notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-80 rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 px-2">
            <span className="text-xs font-bold text-[var(--foreground)]">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-semibold text-[var(--primary)] hover:underline flex items-center gap-0.5"
              >
                <Check className="h-3 w-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="mt-1 max-h-64 overflow-y-auto space-y-1">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--muted-foreground)]">
                All caught up! ☕
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`flex items-start gap-2 rounded-lg p-2 transition-colors ${
                    notification.read ? "opacity-60" : "bg-[var(--primary)]/5 hover:bg-[var(--primary)]/10"
                  }`}
                >
                  <img
                    src={notification.sender?.avatar}
                    alt={notification.sender?.name}
                    className="h-6 w-6 rounded-full border border-[var(--border)] mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--foreground)] truncate">
                      {notification.title}
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)] leading-snug">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="rounded-full p-1 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors flex-shrink-0"
                      title="Mark as read"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
