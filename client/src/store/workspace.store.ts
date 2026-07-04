import { create } from "zustand";

interface WorkspaceState {
  workspaces: any[];
  activeWorkspace: any | null;
  projects: any[];
  activeProject: any | null;
  tasks: any[];
  members: any[];
  onlineUsers: string[]; // array of userIds
  setWorkspaces: (workspaces: any[]) => void;
  setActiveWorkspace: (workspace: any | null) => void;
  setProjects: (projects: any[]) => void;
  setActiveProject: (project: any | null) => void;
  setTasks: (tasks: any[]) => void;
  setMembers: (members: any[]) => void;
  setOnlineUsers: (users: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  clearWorkspaceState: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  activeWorkspace: null,
  projects: [],
  activeProject: null,
  tasks: [],
  members: [],
  onlineUsers: [],

  setWorkspaces: (workspaces) => set({ workspaces }),
  
  setActiveWorkspace: (workspace) =>
    set({
      activeWorkspace: workspace,
      activeProject: null, // Reset project when switching workspaces
      tasks: [],
      projects: [],
      members: [],
    }),

  setProjects: (projects) => set({ projects }),
  
  setActiveProject: (project) => set({ activeProject: project, tasks: [] }),
  
  setTasks: (tasks) => set({ tasks }),
  
  setMembers: (members) => set({ members }),

  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),

  addOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.includes(userId)
        ? state.onlineUsers
        : [...state.onlineUsers, userId],
    })),

  removeOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((id) => id !== userId),
    })),

  clearWorkspaceState: () =>
    set({
      workspaces: [],
      activeWorkspace: null,
      projects: [],
      activeProject: null,
      tasks: [],
      members: [],
      onlineUsers: [],
    }),
}));
