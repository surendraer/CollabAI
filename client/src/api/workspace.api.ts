import api from "./axios";

export const workspaceApi = {
  createWorkspace: (data: { name: string; description?: string }) =>
    api.post("/workspaces", data),

  getWorkspaces: () => api.get("/workspaces"),

  getWorkspaceDetails: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}`),

  updateWorkspace: (workspaceId: string, data: { name: string; description?: string }) =>
    api.patch(`/workspaces/${workspaceId}`, data),

  deleteWorkspace: (workspaceId: string) =>
    api.delete(`/workspaces/${workspaceId}`),

  inviteUser: (workspaceId: string, data: { email: string; role?: string }) =>
    api.post(`/workspaces/${workspaceId}/invite`, data),

  acceptInvite: (token: string) =>
    api.post(`/workspaces/join/${token}`),

  getWorkspaceMembers: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/members`),

  getWorkspaceInvitations: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/invitations`),

  revokeInvitation: (workspaceId: string, invitationId: string) =>
    api.delete(`/workspaces/${workspaceId}/invitations/${invitationId}`),

  updateMemberRole: (workspaceId: string, userId: string, data: { role: string }) =>
    api.patch(`/workspaces/${workspaceId}/members/${userId}`, data),

  removeMember: (workspaceId: string, userId: string) =>
    api.delete(`/workspaces/${workspaceId}/members/${userId}`),
};
