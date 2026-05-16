import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import * as authService from "../services/auth.service";
import { HttpStatus, CookieNames, TokenExpiry } from "../constants";
import config from "../config";

// Cookie options
const accessTokenCookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? ("none" as const) : ("lax" as const),
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: "/",
};

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? ("none" as const) : ("lax" as const),
  maxAge: TokenExpiry.REFRESH_TOKEN,
  path: "/",
};

// ===== REGISTER =====
export const register = catchAsync(async (req: Request, res: Response) => {
  const { user } = await authService.register(req.body);

  res.status(HttpStatus.CREATED).json({
    status: "success",
    message:
      "Registration successful! Please check your email to verify your account.",
    data: { user },
  });
});

// ===== LOGIN =====
export const login = catchAsync(async (req: Request, res: Response) => {
  const userAgent = req.headers["user-agent"] || "unknown";
  const ipAddress =
    (req.headers["x-forwarded-for"] as string) ||
    req.socket.remoteAddress ||
    "unknown";

  const { user, tokens } = await authService.login(
    req.body,
    userAgent,
    ipAddress
  );

  // Set cookies
  res.cookie(
    CookieNames.ACCESS_TOKEN,
    tokens.accessToken,
    accessTokenCookieOptions
  );
  res.cookie(
    CookieNames.REFRESH_TOKEN,
    tokens.refreshToken,
    refreshTokenCookieOptions
  );

  res.status(HttpStatus.OK).json({
    status: "success",
    message: "Login successful",
    data: { user },
  });
});

// ===== LOGOUT =====
export const logout = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[CookieNames.REFRESH_TOKEN];
  await authService.logout(refreshToken);

  // Clear cookies
  res.clearCookie(CookieNames.ACCESS_TOKEN, { path: "/" });
  res.clearCookie(CookieNames.REFRESH_TOKEN, { path: "/" });

  res.status(HttpStatus.OK).json({
    status: "success",
    message: "Logged out successfully",
  });
});

// ===== REFRESH TOKEN =====
export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies?.[CookieNames.REFRESH_TOKEN];
  const userAgent = req.headers["user-agent"] || "unknown";
  const ipAddress =
    (req.headers["x-forwarded-for"] as string) ||
    req.socket.remoteAddress ||
    "unknown";

  const tokens = await authService.refresh(
    oldRefreshToken,
    userAgent,
    ipAddress
  );

  // Set new cookies
  res.cookie(
    CookieNames.ACCESS_TOKEN,
    tokens.accessToken,
    accessTokenCookieOptions
  );
  res.cookie(
    CookieNames.REFRESH_TOKEN,
    tokens.refreshToken,
    refreshTokenCookieOptions
  );

  res.status(HttpStatus.OK).json({
    status: "success",
    message: "Tokens refreshed",
  });
});

// ===== GET ME =====
export const getMe = catchAsync(async (req: Request, res: Response) => {
  res.status(HttpStatus.OK).json({
    status: "success",
    data: { user: req.user },
  });
});

// ===== VERIFY EMAIL =====
export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.params;
  const user = await authService.verifyEmail(token);

  res.status(HttpStatus.OK).json({
    status: "success",
    message: "Email verified successfully",
    data: { user },
  });
});

// ===== FORGOT PASSWORD =====
export const forgotPassword = catchAsync(
  async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);

    // Always return success to prevent email enumeration
    res.status(HttpStatus.OK).json({
      status: "success",
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  }
);

// ===== RESET PASSWORD =====
export const resetPassword = catchAsync(
  async (req: Request, res: Response) => {
    const { token } = req.params;
    await authService.resetPassword(token, req.body.password);

    res.status(HttpStatus.OK).json({
      status: "success",
      message:
        "Password reset successful. Please login with your new password.",
    });
  }
);
