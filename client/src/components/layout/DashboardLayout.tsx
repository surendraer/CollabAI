import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Users,
  Menu,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/hooks/useAuth";
import { useWorkspaceStore } from "@/store/workspace.store";
import { workspaceApi } from "@/api/workspace.api";
import { projectApi } from "@/api/project.api";
import socketClient from "@/lib/socket";
import NotificationBell from "@/components/notifications/NotificationBell";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import CreateWorkspaceModal from "@/components/workspaces/CreateWorkspaceModal";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import toast from "react-hot-toast";

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  const { user, accessToken } = useAuthStore();
  const { mutate: logout } = useLogout();

  const {
    workspaces,
    setWorkspaces,
    activeWorkspace,
    setActiveWorkspace,
    projects,
    setProjects,
    activeProject,
    setActiveProject,
    members,
    setMembers,
    onlineUsers,
    setTasks,
  } = useWorkspaceStore();

  useEffect(() => {
    fetchWorkspaces();
    const socket = socketClient.connect(accessToken || undefined);

    socket.on("task:created", (data: any) => {
      const state = useWorkspaceStore.getState();
      if (state.activeProject?._id === data.task.projectId) {
        state.setTasks([...state.tasks, data.task]);
      }
    });

    socket.on("task:updated", (data: any) => {
      const state = useWorkspaceStore.getState();
      if (state.activeProject?._id === data.task.projectId) {
        state.setTasks(state.tasks.map((t) => (t._id === data.task._id ? data.task : t)));
      }
    });

    socket.on("task:moved", (data: any) => {
      const state = useWorkspaceStore.getState();
      if (state.activeProject?._id === data.projectId) {
        reloadTasks(data.projectId);
      }
    });

    socket.on("task:deleted", (data: any) => {
      const state = useWorkspaceStore.getState();
      if (state.activeProject?._id === data.projectId) {
        state.setTasks(state.tasks.filter((t) => t._id !== data.taskId));
      }
    });

    return () => { socketClient.disconnect(); };
  }, []);

  const reloadTasks = async (projectId: string) => {
    const { taskApi } = await import("@/api/task.api");
    try {
      const { data } = await taskApi.getProjectTasks(projectId);
      setTasks(data.data.tasks);
    } catch { /* silent */ }
  };

  const fetchWorkspaces = async () => {
    try {
      const { data } = await workspaceApi.getWorkspaces();
      const list = data.data.workspaces;
      setWorkspaces(list);
      if (list.length > 0 && !activeWorkspace) {
        setActiveWorkspace(list[0]);
      }
    } catch {
      toast.error("Failed to load workspaces");
    }
  };

  useEffect(() => {
    if (!activeWorkspace) return;
    socketClient.joinWorkspace(activeWorkspace._id);
    fetchWorkspaceData(activeWorkspace._id);
    return () => { socketClient.leaveWorkspace(activeWorkspace._id); };
  }, [activeWorkspace]);

  const fetchWorkspaceData = async (workspaceId: string) => {
    try {
      const projectRes = await projectApi.getWorkspaceProjects(workspaceId);
      setProjects(projectRes.data.data.projects);
      const membersRes = await workspaceApi.getWorkspaceMembers(workspaceId);
      setMembers(membersRes.data.data.members);
    } catch { /* silent */ }
  };

  const handleSwitchWorkspace = (ws: any) => {
    setActiveWorkspace(ws);
    setWorkspaceDropdownOpen(false);
    navigate("/dashboard");
  };

  const handleSelectProject = (project: any) => {
    setActiveProject(project);
    navigate(`/projects/${project._id}`);
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", enabled: true },
    { icon: MessageSquare, label: "Team Chat", href: activeWorkspace ? "/chat" : "#", enabled: !!activeWorkspace },
    { icon: BarChart3, label: "Analytics", href: activeWorkspace ? "/analytics" : "#", enabled: !!activeWorkspace },
    { icon: Settings, label: "Settings", href: activeWorkspace ? "/settings" : "#", enabled: !!activeWorkspace },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo / Workspace Selector */}
      <div className="relative flex h-[64px] items-center border-b border-hairline px-4">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold flex-shrink-0">
            ⚡
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-graphite">Workspace</p>
            <button
              onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
              className="flex w-full items-center gap-1 text-left"
            >
              <span className="text-sm font-bold text-ink truncate">
                {activeWorkspace ? activeWorkspace.name : "Select Workspace"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-graphite flex-shrink-0" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {workspaceDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setWorkspaceDropdownOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute left-4 top-16 z-20 w-56 rounded-lg border border-hairline bg-card shadow-floating-modal"
              >
                <div className="p-1.5">
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-graphite">
                    Your Workspaces
                  </p>
                  <div className="max-h-44 overflow-y-auto space-y-0.5">
                    {workspaces.map((ws) => (
                      <button
                        key={ws._id}
                        onClick={() => handleSwitchWorkspace(ws)}
                        className={`w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                          activeWorkspace?._id === ws._id
                            ? "bg-primary/8 text-primary font-semibold"
                            : "text-ink hover:bg-cloud"
                        }`}
                      >
                        {ws.name}
                      </button>
                    ))}
                  </div>
                  <div className="mt-1 border-t border-hairline pt-1">
                    <button
                      onClick={() => {
                        setWorkspaceDropdownOpen(false);
                        setWorkspaceModalOpen(true);
                      }}
                      className="flex w-full items-center gap-1.5 rounded-md px-2.5 py-2 text-left text-sm font-semibold text-primary hover:bg-primary/5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      New Workspace
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Main Nav */}
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== "/dashboard" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                to={item.enabled ? item.href : "#"}
                onClick={(e) => {
                  if (!item.enabled) e.preventDefault();
                  setMobileOpen(false);
                }}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  !item.enabled
                    ? "text-steel cursor-not-allowed"
                    : isActive
                    ? "bg-primary text-white"
                    : "text-ink hover:bg-cloud"
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Projects */}
        {activeWorkspace && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-graphite">
                Projects
              </span>
              <button
                onClick={() => setProjectModalOpen(true)}
                className="rounded p-0.5 hover:bg-cloud text-graphite hover:text-ink transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-0.5 max-h-40 overflow-y-auto">
              {projects.length === 0 ? (
                <p className="text-[11px] text-graphite px-3 py-2 italic">No projects yet</p>
              ) : (
                projects.map((p) => {
                  const isSelected = activeProject?._id === p._id;
                  return (
                    <button
                      key={p._id}
                      onClick={() => {
                        handleSelectProject(p);
                        setMobileOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? "bg-primary/8 text-primary font-semibold border-l-2 border-primary"
                          : "text-charcoal hover:bg-cloud hover:text-ink"
                      }`}
                    >
                      <FolderKanban className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{p.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Team Members */}
        {members.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-3">
              <Users className="h-3.5 w-3.5 text-graphite" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-graphite">
                Team
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 px-3">
              {members.slice(0, 8).map((m) => {
                const isOnline = onlineUsers.includes(m.userId._id);
                return (
                  <div key={m.userId._id} className="relative group">
                    <img
                      src={m.userId.avatar}
                      alt={m.userId.name}
                      className={`h-7 w-7 rounded-full border-2 ${
                        isOnline ? "border-emerald-400" : "border-hairline"
                      }`}
                    />
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                    )}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block rounded-lg bg-ink px-2.5 py-1 text-[10px] text-white whitespace-nowrap z-30 shadow-floating-modal">
                      {m.userId.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-hairline p-3">
        {user && (
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 mb-1">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-7 w-7 rounded-full border border-hairline"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink truncate">{user.name}</p>
              <p className="text-[10px] text-graphite truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => { socketClient.disconnect(); logout(); }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-graphite hover:bg-bloom-rose/30 hover:text-bloom-deep transition-colors"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[248px] flex-shrink-0 flex-col bg-card border-r border-hairline">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-ink/30 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -248 }}
              animate={{ x: 0 }}
              exit={{ x: -248 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 w-[248px] bg-card border-r border-hairline shadow-floating-modal lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="flex h-[64px] items-center justify-between border-b border-hairline bg-card px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-hairline text-ink-muted hover:bg-cloud transition-colors"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm min-w-0">
              <span className="font-semibold text-ink truncate">
                {activeWorkspace?.name || "CollabAI"}
              </span>
              {activeProject && (
                <>
                  <span className="text-steel">/</span>
                  <span className="font-semibold text-primary truncate">{activeProject.name}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <NotificationBell />
            <ThemeToggle />

            {user && (
              <div className="flex items-center gap-2 border-l border-hairline pl-3 ml-1">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full border border-hairline"
                />
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-ink leading-none">{user.name.split(" ")[0]}</p>
                  {activeWorkspace?.role && (
                    <p className="text-[10px] text-graphite capitalize mt-0.5">{activeWorkspace.role}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background">
          <div className="max-w-[1200px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Modals */}
      <CreateWorkspaceModal isOpen={workspaceModalOpen} onClose={() => setWorkspaceModalOpen(false)} />
      <CreateProjectModal isOpen={projectModalOpen} onClose={() => setProjectModalOpen(false)} />
    </div>
  );
}
