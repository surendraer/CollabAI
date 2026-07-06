import api from "./axios";

export const aiApi = {
  getTaskBreakdown: (description: string) =>
    api.post("/ai/task-breakdown", { description }),

  getSprintSummary: (projectId: string) =>
    api.post("/ai/sprint-summary", { projectId }),

  analyzeError: (errorLog: string) =>
    api.post("/ai/analyze-error", { errorLog }),

  parseNotes: (notes: string) =>
    api.post("/ai/meeting-notes", { notes }),

  getLiteratureReview: (topic: string) =>
    api.post("/ai/literature-review", { topic }),
};
