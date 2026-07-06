import api from "./axios";

export const taskApi = {
  createTask: (data: {
    title: string;
    description?: string;
    projectId: string;
    workspaceId: string;
    assigneeId?: string;
    assigneeIds?: string[];
    priority?: "high" | "medium" | "low";
    status?: "todo" | "in-progress" | "done";
    stageId?: string;
    type?: "task" | "milestone";
    dueDate?: string;
    reminderAt?: string;
    labels?: string[];
  }) => api.post("/tasks", data),

  getProjectTasks: (
    projectId: string,
    params?: { stageId?: string; status?: string; priority?: string; assigneeId?: string; search?: string }
  ) => api.get(`/tasks/project/${projectId}`, { params }),

  getTaskDetails: (taskId: string) =>
    api.get(`/tasks/${taskId}`),

  updateTask: (
    taskId: string,
    data: {
      title?: string;
      description?: string;
      assigneeId?: string | null;
      assigneeIds?: string[];
      priority?: "high" | "medium" | "low";
      status?: "todo" | "in-progress" | "done";
      stageId?: string;
      type?: "task" | "milestone";
      dueDate?: string | null;
      reminderAt?: string | null;
      labels?: string[];
      subtasks?: any[];
    }
  ) => api.patch(`/tasks/${taskId}`, data),

  moveTask: (
    taskId: string,
    data: {
      stageId?: string;
      status?: "todo" | "in-progress" | "done";
      targetOrder: number;
    }
  ) => api.patch(`/tasks/${taskId}/move`, data),

  deleteTask: (taskId: string) =>
    api.delete(`/tasks/${taskId}`),

  addComment: (taskId: string, data: { content: string }) =>
    api.post(`/tasks/${taskId}/comments`, data),

  toggleSubtask: (taskId: string, subtaskId: string) =>
    api.patch(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`),

  getWorkspaceActivity: (workspaceId: string) =>
    api.get(`/tasks/workspace/${workspaceId}/activity`),
};
