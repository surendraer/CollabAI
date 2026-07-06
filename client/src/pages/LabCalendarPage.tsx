import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, AlertCircle } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace.store";
import { taskApi } from "@/api/task.api";
import toast from "react-hot-toast";

export default function LabCalendarPage() {
  const { activeWorkspace, projects } = useWorkspaceStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeWorkspace && projects.length > 0) {
      fetchAllTasks();
    }
  }, [activeWorkspace, projects]);

  const fetchAllTasks = async () => {
    setIsLoading(true);
    try {
      const taskPromises = projects.map(p => taskApi.getProjectTasks(p._id));
      const results = await Promise.all(taskPromises);
      const combined = results.flatMap(res => res.data.data.tasks);
      setAllTasks(combined);
    } catch {
      toast.error("Failed to load calendar deadlines");
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper to extract tasks due on a specific day
  const getTasksForDay = (day: number) => {
    return allTasks.filter(t => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const renderDays = () => {
    const totalSlots = 42; // 6 rows of 7 days
    const dayElements = [];

    // Empty slots for previous month's tail
    for (let i = 0; i < firstDayIndex; i++) {
      dayElements.push(
        <div key={`empty-${i}`} className="h-28 border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617]/40 p-2" />
      );
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTasks = getTasksForDay(day);
      const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

      dayElements.push(
        <div
          key={day}
          className={`h-28 border border-[#e0e0e0] dark:border-[#333333] p-2 flex flex-col justify-between overflow-hidden group transition-colors hover:bg-[#fafafc] dark:hover:bg-[#272729] ${
            isToday ? "bg-[#0066cc]/5" : "bg-white dark:bg-[#272729]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isToday ? "text-[#0066cc] font-bold" : "text-[#1d1d1f] dark:text-white"}`}>
              {day}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 mt-1.5 scrollbar-none">
            {dayTasks.map(task => (
              <div
                key={task._id}
                className={`px-1.5 py-0.5 rounded text-[10px] truncate font-medium ${
                  task.priority === "high" || task.priority === "urgent"
                    ? "bg-[#ff3b30]/10 text-[#ff3b30]"
                    : "bg-[#0066cc]/10 text-[#0066cc]"
                }`}
                title={task.title}
              >
                {task.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Empty slots for next month's head
    const remainingSlots = totalSlots - dayElements.length;
    for (let i = 0; i < remainingSlots; i++) {
      dayElements.push(
        <div key={`empty-tail-${i}`} className="h-28 border border-[#e0e0e0] dark:border-[#333333] bg-[#f5f5f7] dark:bg-[#161617]/40 p-2" />
      );
    }

    return dayElements;
  };

  if (!activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-[#7a7a7a]">Select a workspace to view deadlines calendar.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[18px] bg-white dark:bg-[#272729] border border-[#e0e0e0] dark:border-[#333333] p-6 shadow-apple-product space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#e0e0e0] dark:border-[#333333]">
        <div>
          <h1 className="text-lg font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#0066cc]" />
            Lab Submission Calendar
          </h1>
          <p className="text-xs text-[#7a7a7a] mt-0.5">Visualize paper draft deadlines and co-author review milestones</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full border border-[#e0e0e0] dark:border-[#333333] hover:bg-[#f5f5f7] dark:hover:bg-[#161617] text-[#7a7a7a] transition-all active-scale"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-[#1d1d1f] dark:text-white min-w-32 text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full border border-[#e0e0e0] dark:border-[#333333] hover:bg-[#f5f5f7] dark:hover:bg-[#161617] text-[#7a7a7a] transition-all active-scale"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid calendar */}
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#7a7a7a] border-b border-[#e0e0e0] dark:border-[#333333] pb-2">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="grid grid-cols-7 border-l border-t border-[#e0e0e0] dark:border-[#333333] overflow-hidden rounded-xl">
        {renderDays()}
      </div>

      {/* Details Box */}
      <div className="rounded-xl border border-[#ff9500]/20 bg-[#ff9500]/5 p-4 flex gap-2.5 items-start text-xs text-[#ff9500] dark:text-[#ffb340]">
        <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Reminders Active</p>
          <p className="mt-0.5 leading-relaxed">
            Co-authors and scholars will automatically receive emails and dashboard push notifications exactly 24 hours before any calendar milestone's due date.
          </p>
        </div>
      </div>
    </div>
  );
}
