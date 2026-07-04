import api from "./axios";

export const projectApi = {
  createProject: (data: { name: string; description?: string; workspaceId: string }) =>
    api.post("/projects", data),

  getWorkspaceProjects: (workspaceId: string) =>
    api.get(`/projects/workspace/${workspaceId}`),

  getProjectDetails: (projectId: string) =>
    api.get(`/projects/${projectId}`),

  updateProject: (projectId: string, data: { name?: string; description?: string; status?: "active" | "archived" }) =>
    api.patch(`/projects/${projectId}`, data),

  deleteProject: (projectId: string) =>
    api.delete(`/projects/${projectId}`),
};
