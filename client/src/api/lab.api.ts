import api from "./axios";

export const labApi = {
  getMyLabs: () => api.get("/labs"),

  createLab: (data: { name: string; description?: string; institution?: string }) =>
    api.post("/labs", data),

  getLabDetails: (labId: string) =>
    api.get(`/labs/${labId}`),

  updateLab: (labId: string, data: { name: string; description?: string; institution?: string }) =>
    api.patch(`/labs/${labId}`, data),

  archiveLab: (labId: string) =>
    api.delete(`/labs/${labId}`),

  getLabMembers: (labId: string) =>
    api.get(`/labs/${labId}/members`),

  inviteToLab: (labId: string, data: { email: string; role?: string }) =>
    api.post(`/labs/${labId}/invite`, data),

  acceptLabInvite: (token: string) =>
    api.post(`/labs/accept-invite/${token}`),

  updateLabMemberRole: (labId: string, userId: string, data: { role: string }) =>
    api.patch(`/labs/${labId}/members/${userId}/role`, data),

  removeLabMember: (labId: string, userId: string) =>
    api.delete(`/labs/${labId}/members/${userId}`),

  getLabWorkspaces: (labId: string) =>
    api.get(`/labs/${labId}/workspaces`),
};
