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
  BookOpen,
  Calendar,
  FileText,
  Folder,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/hooks/useAuth";
import { useWorkspaceStore } from "@/store/workspace.store";
import { labApi } from "@/api/lab.api";
import { workspaceApi } from "@/api/workspace.api";
import { projectApi } from "@/api/project.api";
import socketClient from "@/lib/socket";
import NotificationBell from "@/components/notifications/NotificationBell";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import CreateWorkspaceModal from "@/components/workspaces/CreateWorkspaceModal";
import CreateLabModal from "@/components/labs/CreateLabModal";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import toast from "react-hot-toast";

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [labDropdownOpen, setLabDropdownOpen] = useState(false);
  
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  const { user, accessToken } = useAuthStore();
  const { mutate: logout } = useLogout();

  const {
    labs,
    setLabs,
    activeLab,
    setActiveLab,
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
    fetchLabs();
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

  const fetchLabs = async () => {
    try {
      const { data } = await labApi.getMyLabs();
      const list = data.data.labs;
      setLabs(list);
      if (list.length > 0 && !activeLab) {
        setActiveLab(list[0]);
      }
    } catch {
      toast.error("Failed to load laboratories");
    }
  };

  // Fetch workspaces when active Lab changes
  useEffect(() => {
    if (!activeLab) return;
    fetchWorkspacesForLab(activeLab._id);
  }, [activeLab]);

  const fetchWorkspacesForLab = async (labId: string) => {
    try {
      const { data } = await labApi.getLabWorkspaces(labId);
      const list = data.data.workspaces;
      setWorkspaces(list);
      if (list.length > 0 && !activeWorkspace) {
        setActiveWorkspace(list[0]);
      }
    } catch {
      toast.error("Failed to load paper workspaces");
    }
  };

  // Fetch projects and members when active Workspace (paper) changes
  useEffect(() => {
    if (!activeWorkspace) return;
    socketClient.joinWorkspace(activeWorkspace._id);
    fetchWorkspaceData(activeWorkspace._id);
    return () => { socketClient.leaveWorkspace(activeWorkspace._id); };
  }, [activeWorkspace]);

  const fetchWorkspaceData = async (workspaceId: string) => {
    try {
      const projectRes = await projectApi.getWorkspaceProjects(workspaceId);
      const projList = projectRes.data.data.projects;
      setProjects(projList);
      
      // Select first project/board by default if not set
      if (projList.length > 0 && !activeProject) {
        setActiveProject(projList[0]);
      }

      const membersRes = await workspaceApi.getWorkspaceMembers(workspaceId);
      setMembers(membersRes.data.data.members);
    } catch { /* silent */ }
  };

  const handleSwitchLab = (lab: any) => {
    setActiveLab(lab);
    setLabDropdownOpen(false);
    navigate("/dashboard");
  };

  const handleSelectWorkspace = (ws: any) => {
    setActiveWorkspace(ws);
    // Fetch projects for this workspace to auto-navigate
    projectApi.getWorkspaceProjects(ws._id).then(({ data }) => {
      const projList = data.data.projects;
      setProjects(projList);
      if (projList.length > 0) {
        setActiveProject(projList[0]);
        navigate(`/projects/${projList[0]._id}`);
      } else {
        setActiveProject(null);
        navigate("/dashboard");
      }
    });
  };

  const handleSelectProject = (project: any) => {
    setActiveProject(project);
    navigate(`/projects/${project._id}`);
  };

  const labNavItems = [
    { icon: LayoutDashboard, label: "Lab Home", href: "/dashboard", enabled: true },
    { icon: Calendar, label: "Submission Calendar", href: "/calendar", enabled: true },
    { icon: MessageSquare, label: "Direct Messages", href: "/dms", enabled: true },
  ];

  const paperNavItems = [
    { icon: FolderKanban, label: "Milestone Board", href: activeProject ? `/projects/${activeProject._id}` : "#", enabled: !!activeProject },
    { icon: FileText, label: "Lab Journal / Notes", href: "/notes", enabled: !!activeWorkspace },
    { icon: Folder, label: "Shared Files", href: "/files", enabled: !!activeWorkspace },
    { icon: BarChart3, label: "Analytics", href: "/analytics", enabled: !!activeWorkspace },
    { icon: Settings, label: "Settings", href: "/settings", enabled: !!activeWorkspace },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[#f5f5f7] dark:bg-[#161617] border-r border-[#e0e0e0] dark:border-[#333333]">
      {/* Lab Switcher Selector */}
      <div className="relative flex h-[64px] items-center border-b border-[#e0e0e0] dark:border-[#333333] px-4 bg-white dark:bg-[#272729]">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0066cc] text-white flex-shrink-0">
            <BookOpen className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7a7a7a] dark:text-[#cccccc]">Research Laboratory</p>
            <button
              onClick={() => setLabDropdownOpen(!labDropdownOpen)}
              className="flex w-full items-center gap-1 text-left"
            >
              <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white truncate">
                {activeLab ? activeLab.name : "Select Lab"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[#7a7a7a] flex-shrink-0" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {labDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setLabDropdownOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute left-4 top-16 z-20 w-56 rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#272729] shadow-apple-product"
              >
                <div className="p-1.5">
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#7a7a7a] dark:text-[#cccccc]">
                    Your Laboratories
                  </p>
                  <div className="max-h-44 overflow-y-auto space-y-0.5">
                    {labs.map((l) => (
                      <button
                        key={l._id}
                        onClick={() => handleSwitchLab(l)}
                        className={`w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                          activeLab?._id === l._id
                            ? "bg-[#0066cc]/10 text-[#0066cc] font-semibold"
                            : "text-[#1d1d1f] dark:text-[#cccccc] hover:bg-[#f5f5f7] dark:hover:bg-[#161617]"
                        }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                  <div className="mt-1 border-t border-[#e0e0e0] dark:border-[#333333] pt-1">
                    <button
                      onClick={() => {
                        setLabDropdownOpen(false);
                        setLabModalOpen(true);
                      }}
                      className="flex w-full items-center gap-1.5 rounded-md px-2.5 py-2 text-left text-sm font-semibold text-[#0066cc] hover:bg-[#0066cc]/5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create Laboratory
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* Lab Navigation */}
        <div className="space-y-0.5">
          {labNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.enabled ? item.href : "#"}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#0066cc]/10 text-[#0066cc] font-semibold"
                    : "text-[#1d1d1f] dark:text-[#cccccc] hover:bg-[#e8e8ed] dark:hover:bg-[#272729]"
                }`}
              >
                <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Papers List */}
        {activeLab && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#7a7a7a] dark:text-[#cccccc]">
                Research Papers
              </span>
              <button
                onClick={() => setWorkspaceModalOpen(true)}
                className="rounded p-0.5 hover:bg-[#e8e8ed] dark:hover:bg-[#272729] text-[#7a7a7a] hover:text-[#1d1d1f] transition-colors"
                title="Create Workspace / Paper"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-0.5 max-h-32 overflow-y-auto">
              {workspaces.length === 0 ? (
                <p className="text-[11px] text-[#7a7a7a] dark:text-[#cccccc] px-3 py-1 italic">No papers in progress</p>
              ) : (
                workspaces.map((ws) => {
                  const isSelected = activeWorkspace?._id === ws._id;
                  return (
                    <button
                      key={ws._id}
                      onClick={() => handleSelectWorkspace(ws)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-left text-sm transition-all ${
                        isSelected
                          ? "bg-[#0066cc]/5 text-[#0066cc] font-semibold border-l-2 border-[#0066cc]"
                          : "text-[#1d1d1f] dark:text-[#cccccc] hover:bg-[#e8e8ed] dark:hover:bg-[#272729]"
                      }`}
                    >
                      <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{ws.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Paper Sub Navigation */}
        {activeWorkspace && (
          <div className="space-y-1.5 border-t border-[#e0e0e0] dark:border-[#333333] pt-4">
            <div className="flex items-center justify-between px-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#0066cc] truncate max-w-[80%]">
                {activeWorkspace.name}
              </span>
            </div>
            <div className="space-y-0.5">
              {paperNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    to={item.enabled ? item.href : "#"}
                    onClick={(e) => {
                      if (!item.enabled) e.preventDefault();
                      setMobileOpen(false);
                    }}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      !item.enabled
                        ? "text-[#7a7a7a] opacity-50 cursor-not-allowed"
                        : isActive
                        ? "bg-[#0066cc]/10 text-[#0066cc] font-semibold"
                        : "text-[#1d1d1f] dark:text-[#cccccc] hover:bg-[#e8e8ed] dark:hover:bg-[#272729]"
                    }`}
                  >
                    <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Sub projects inside the paper */}
        {activeWorkspace && projects.length > 1 && (
          <div className="space-y-1.5 border-t border-[#e0e0e0] dark:border-[#333333] pt-4">
            <div className="flex items-center justify-between px-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#7a7a7a]">
                Sub Modules
              </span>
              <button
                onClick={() => setProjectModalOpen(true)}
                className="rounded p-0.5 hover:bg-[#e8e8ed] dark:hover:bg-[#272729] text-[#7a7a7a] hover:text-[#1d1d1f] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-0.5 max-h-28 overflow-y-auto">
              {projects.map((p) => {
                const isSelected = activeProject?._id === p._id;
                return (
                  <button
                    key={p._id}
                    onClick={() => handleSelectProject(p)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-1 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-[#0066cc]/10 text-[#0066cc] font-semibold"
                        : "text-[#1d1d1f] dark:text-[#cccccc] hover:bg-[#e8e8ed] dark:hover:bg-[#272729]"
                    }`}
                  >
                    <FolderKanban className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-[#e0e0e0] dark:border-[#333333] p-3 bg-white dark:bg-[#272729]">
        {user && (
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 mb-1">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-7 w-7 rounded-full border border-[#e0e0e0] dark:border-[#333333]"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#1d1d1f] dark:text-white truncate">{user.name}</p>
              <p className="text-[9px] text-[#7a7a7a] dark:text-[#cccccc] truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => { socketClient.disconnect(); logout(); }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-colors"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#ffffff] dark:bg-[#161617] overflow-hidden transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[248px] flex-shrink-0 flex-col bg-[#f5f5f7] dark:bg-[#161617] border-r border-[#e0e0e0] dark:border-[#333333]">
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
              className="fixed inset-0 z-40 bg-[#1d1d1f]/30 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -248 }}
              animate={{ x: 0 }}
              exit={{ x: -248 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 w-[248px] bg-white border-r border-[#e0e0e0] dark:border-[#333333] shadow-apple-product lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="flex h-[64px] items-center justify-between border-b border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#272729] px-4 lg:px-6 flex-shrink-0 transition-colors duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0e0e0] dark:border-[#333333] text-[#7a7a7a] hover:bg-[#f5f5f7] dark:hover:bg-[#161617] transition-colors"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm min-w-0">
              <span className="font-semibold text-[#1d1d1f] dark:text-white truncate">
                {activeLab?.name || "Laboratory"}
              </span>
              {activeWorkspace && (
                <>
                  <span className="text-[#7a7a7a] font-normal">/</span>
                  <span className="font-semibold text-[#0066cc] dark:text-[#2997ff] truncate">{activeWorkspace.name}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <NotificationBell />
            <ThemeToggle />

            {user && (
              <div className="flex items-center gap-2 border-l border-[#e0e0e0] dark:border-[#333333] pl-3 ml-1">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full border border-[#e0e0e0] dark:border-[#333333]"
                />
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white leading-none">{user.name.split(" ")[0]}</p>
                  {activeLab?.role && (
                    <p className="text-[9px] text-[#7a7a7a] dark:text-[#cccccc] capitalize mt-0.5">{activeLab.role}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-white dark:bg-[#161617] transition-colors duration-200">
          <div className="max-w-[1200px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Modals */}
      <CreateLabModal isOpen={labModalOpen} onClose={() => setLabModalOpen(false)} />
      <CreateWorkspaceModal isOpen={workspaceModalOpen} onClose={() => setWorkspaceModalOpen(false)} />
      <CreateProjectModal isOpen={projectModalOpen} onClose={() => setProjectModalOpen(false)} />
    </div>
  );
}
