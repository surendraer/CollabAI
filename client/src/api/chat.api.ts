import api from "./axios";

export const chatApi = {
  getWorkspaceMessages: (workspaceId: string) =>
    api.get(`/chat/workspace/${workspaceId}`),

  sendMessage: (workspaceId: string, data: { content: string; projectId?: string }) =>
    api.post(`/chat/workspace/${workspaceId}`, data),
};
