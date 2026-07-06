// ============================================================
// constants/index.ts
// Central store for all application-wide constant values.
// ============================================================

// ===== HTTP Status Codes =====
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ===== Lab Roles (4-tier academic hierarchy) =====
export const LabRoles = {
  OWNER: "owner",           // PI — Principal Investigator; full control
  LAB_ASSISTANT: "lab_assistant", // Lab manager; can invite, edit all tasks
  RESEARCHER: "researcher", // Full edit access within workspace
  STUDENT: "student",       // Limited — own tasks, chat, view
} as const;

export type LabRole = (typeof LabRoles)[keyof typeof LabRoles];

// ===== Workspace Roles (can override lab role within a workspace) =====
export const WorkspaceRoles = {
  OWNER: "owner",
  ADMIN: "admin",           // kept for backward-compat during migration
  MANAGER: "manager",       // kept for backward-compat
  MEMBER: "member",         // kept for backward-compat
} as const;

export type WorkspaceRole = (typeof WorkspaceRoles)[keyof typeof WorkspaceRoles];

// ===== System Roles (platform-level, not workspace-level) =====
export const SystemRoles = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type SystemRole = (typeof SystemRoles)[keyof typeof SystemRoles];

// ===== Auth Providers =====
export const AuthProviders = {
  LOCAL: "local",
  GOOGLE: "google",
} as const;

export type AuthProvider = (typeof AuthProviders)[keyof typeof AuthProviders];

// ===== Task / Pipeline =====
export const TaskPriority = {
  URGENT: "urgent",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

export type TaskPriorityType = (typeof TaskPriority)[keyof typeof TaskPriority];

export const TaskType = {
  TASK: "task",
  MILESTONE: "milestone",
} as const;

export type TaskTypeValue = (typeof TaskType)[keyof typeof TaskType];

// ===== Workspace Types =====
export const WorkspaceType = {
  PAPER: "paper",
  PROJECT: "project",
} as const;

export type WorkspaceTypeValue = (typeof WorkspaceType)[keyof typeof WorkspaceType];

// ===== Workspace Status =====
export const WorkspaceStatus = {
  ACTIVE: "active",
  COMPLETED: "completed",
  ARCHIVED: "archived",
} as const;

// ===== Error Messages =====
export const ErrorMessages = {
  // Auth
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_ALREADY_EXISTS: "An account with this email already exists",
  USER_NOT_FOUND: "User not found",
  INVALID_TOKEN: "Invalid or expired token",
  TOKEN_EXPIRED: "Token has expired",
  UNAUTHORIZED: "You are not authorized to access this resource",
  FORBIDDEN: "You do not have permission to perform this action",
  EMAIL_NOT_VERIFIED: "Please verify your email address before continuing",
  EMAIL_ALREADY_VERIFIED: "Email is already verified",

  // Lab / Workspace
  LAB_NOT_FOUND: "Lab not found",
  WORKSPACE_NOT_FOUND: "Workspace not found",
  NOT_LAB_MEMBER: "You are not a member of this lab",
  NOT_WORKSPACE_MEMBER: "You are not a member of this workspace",
  ALREADY_LAB_MEMBER: "User is already a member of this lab",
  ALREADY_WORKSPACE_MEMBER: "User is already a member of this workspace",
  CANNOT_REMOVE_OWNER: "Cannot remove the owner of this lab or workspace",
  CANNOT_CHANGE_OWNER_ROLE: "Cannot change owner role. Transfer ownership instead.",

  // Pipeline
  STAGE_NOT_FOUND: "Pipeline stage not found",
  CANNOT_DELETE_DEFAULT_STAGE: "Cannot delete the only remaining pipeline stage",

  // Files
  FILE_TOO_LARGE: "File size exceeds the 50 MB limit",
  FILE_TYPE_NOT_ALLOWED: "File type is not allowed",
  FILE_STORAGE_NOT_CONFIGURED: "File storage is not configured on this server",
  FILE_NOT_FOUND: "File not found",

  // General
  NOT_FOUND: "Resource not found",
  INTERNAL_ERROR: "Something went wrong. Please try again later.",
  VALIDATION_ERROR: "Validation failed",
  RATE_LIMIT: "Too many requests. Please try again later.",
} as const;

// ===== Token Expiry (in milliseconds) =====
export const TokenExpiry = {
  VERIFICATION: 24 * 60 * 60 * 1000,       // 24 hours
  PASSWORD_RESET: 60 * 60 * 1000,           // 1 hour
  REFRESH_TOKEN: 7 * 24 * 60 * 60 * 1000,  // 7 days
  INVITATION: 48 * 60 * 60 * 1000,         // 48 hours
} as const;

// ===== Cookie Names =====
export const CookieNames = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
} as const;

// ===== Pagination Defaults =====
export const Pagination = {
  DEFAULT_LIMIT: 50,
  DM_LIMIT: 100,
  ACTIVITY_LIMIT: 50,
  NOTIFICATIONS_LIMIT: 30,
} as const;
