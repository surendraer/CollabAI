import api from "./axios";

export const meetingNoteApi = {
  getMeetingNotes: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/notes`),

  getMeetingNoteDetails: (workspaceId: string, noteId: string) =>
    api.get(`/workspaces/${workspaceId}/notes/${noteId}`),

  createMeetingNote: (workspaceId: string, data: { title: string; content?: string }) =>
    api.post(`/workspaces/${workspaceId}/notes`, data),

  updateMeetingNote: (workspaceId: string, noteId: string, data: { title?: string; content?: string }) =>
    api.patch(`/workspaces/${workspaceId}/notes/${noteId}`, data),

  deleteMeetingNote: (workspaceId: string, noteId: string) =>
    api.delete(`/workspaces/${workspaceId}/notes/${noteId}`),
};
