import { create } from "zustand";

interface WorkspaceState {
  labs: any[];
  activeLab: any | null;
  workspaces: any[];
  activeWorkspace: any | null;
  projects: any[];
  activeProject: any | null;
  tasks: any[];
  members: any[];
  pipelineStages: any[];
  meetingNotes: any[];
  files: any[];
  onlineUsers: string[]; // array of userIds
  setLabs: (labs: any[]) => void;
  setActiveLab: (lab: any | null) => void;
  setWorkspaces: (workspaces: any[]) => void;
  setActiveWorkspace: (workspace: any | null) => void;
  setProjects: (projects: any[]) => void;
  setActiveProject: (project: any | null) => void;
  setTasks: (tasks: any[]) => void;
  setMembers: (members: any[]) => void;
  setPipelineStages: (stages: any[]) => void;
  setMeetingNotes: (notes: any[]) => void;
  setFiles: (files: any[]) => void;
  setOnlineUsers: (users: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  clearWorkspaceState: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  labs: [],
  activeLab: null,
  workspaces: [],
  activeWorkspace: null,
  projects: [],
  activeProject: null,
  tasks: [],
  members: [],
  pipelineStages: [],
  meetingNotes: [],
  files: [],
  onlineUsers: [],

  setLabs: (labs) => set({ labs }),
  
  setActiveLab: (lab) =>
    set({
      activeLab: lab,
      activeWorkspace: null,
      activeProject: null,
      workspaces: [],
      projects: [],
      tasks: [],
      members: [],
      pipelineStages: [],
      meetingNotes: [],
      files: [],
    }),

  setWorkspaces: (workspaces) => set({ workspaces }),
  
  setActiveWorkspace: (workspace) =>
    set({
      activeWorkspace: workspace,
      activeProject: null,
      tasks: [],
      projects: [],
      members: [],
      pipelineStages: [],
      meetingNotes: [],
      files: [],
    }),

  setProjects: (projects) => set({ projects }),
  
  setActiveProject: (project) => set({ activeProject: project, tasks: [] }),
  
  setTasks: (tasks) => set({ tasks }),
  
  setMembers: (members) => set({ members }),

  setPipelineStages: (pipelineStages) => set({ pipelineStages }),

  setMeetingNotes: (meetingNotes) => set({ meetingNotes }),

  setFiles: (files) => set({ files }),

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
      labs: [],
      activeLab: null,
      workspaces: [],
      activeWorkspace: null,
      projects: [],
      activeProject: null,
      tasks: [],
      members: [],
      pipelineStages: [],
      meetingNotes: [],
      files: [],
      onlineUsers: [],
    }),
}));
