import api from "./axios";

export const dmApi = {
  getDirectMessages: (recipientId: string) =>
    api.get(`/messages/dm/${recipientId}`),

  sendDirectMessage: (recipientId: string, data: { content: string; attachments?: string[] }) =>
    api.post(`/messages/dm/${recipientId}`, data),
};
