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
} as const;

// ===== Workspace Roles =====
export const WorkspaceRoles = {
  OWNER: "owner",
  ADMIN: "admin",
  MANAGER: "manager",
  MEMBER: "member",
} as const;

export type WorkspaceRole =
  (typeof WorkspaceRoles)[keyof typeof WorkspaceRoles];

// ===== System Roles =====
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

export type AuthProvider =
  (typeof AuthProviders)[keyof typeof AuthProviders];

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
  EMAIL_NOT_VERIFIED: "Please verify your email address",
  EMAIL_ALREADY_VERIFIED: "Email is already verified",

  // General
  NOT_FOUND: "Resource not found",
  INTERNAL_ERROR: "Something went wrong. Please try again later.",
  VALIDATION_ERROR: "Validation error",
  RATE_LIMIT: "Too many requests. Please try again later.",
} as const;

// ===== Token Expiry =====
export const TokenExpiry = {
  VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET: 60 * 60 * 1000, // 1 hour
  REFRESH_TOKEN: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

// ===== Cookie Names =====
export const CookieNames = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
} as const;
