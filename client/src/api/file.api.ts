import api from "./axios";

export const fileApi = {
  getWorkspaceFiles: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/files`),

  uploadFile: (workspaceId: string, data: { fileData: string; fileName: string; taskId?: string }) =>
    api.post(`/workspaces/${workspaceId}/files`, data),

  deleteFile: (workspaceId: string, fileId: string) =>
    api.delete(`/workspaces/${workspaceId}/files/${fileId}`),
};
