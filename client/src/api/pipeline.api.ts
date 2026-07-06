import api from "./axios";

export const pipelineApi = {
  getPipelineStages: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/pipeline`),

  createPipelineStage: (workspaceId: string, data: { name: string; color?: string }) =>
    api.post(`/workspaces/${workspaceId}/pipeline`, data),

  updatePipelineStage: (workspaceId: string, stageId: string, data: { name?: string; color?: string; isDefault?: boolean }) =>
    api.patch(`/workspaces/${workspaceId}/pipeline/${stageId}`, data),

  reorderPipelineStages: (workspaceId: string, stageIds: string[]) =>
    api.put(`/workspaces/${workspaceId}/pipeline/reorder`, { stageIds }),

  deletePipelineStage: (workspaceId: string, stageId: string, fallbackStageId: string) =>
    api.delete(`/workspaces/${workspaceId}/pipeline/${stageId}`, { data: { fallbackStageId } }),
};
