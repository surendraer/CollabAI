import User, { IUser } from "../models/user.model";
import Session from "../models/session.model";
import AppError from "../utils/AppError";
import {
  HttpStatus,
  ErrorMessages,
  TokenExpiry,
  AuthProviders,
} from "../constants";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateRandomToken,
  hashToken,
} from "./token.service";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "./email.service";
import type { RegisterInput, LoginInput } from "../validators/auth.validator";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  user: IUser;
  tokens: AuthTokens;
}

// ===== REGISTER =====
export const register = async (
  input: RegisterInput
): Promise<{ user: IUser; verificationToken: string }> => {
  const { name, email, password } = input;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(
      ErrorMessages.EMAIL_ALREADY_EXISTS,
      HttpStatus.CONFLICT
    );
  }

  // Generate verification token
  const rawToken = generateRandomToken();
  const hashedToken = hashToken(rawToken);

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    verificationToken: hashedToken,
    verificationExpires: new Date(Date.now() + TokenExpiry.VERIFICATION),
  });

  // Send verification email
  await sendVerificationEmail(email, name, rawToken);

  return { user, verificationToken: rawToken };
};

// ===== LOGIN =====
export const login = async (
  input: LoginInput,
  userAgent: string,
  ipAddress: string
): Promise<AuthResult> => {
  const { email, password } = input;

  // Find user with password field
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError(
      ErrorMessages.INVALID_CREDENTIALS,
      HttpStatus.UNAUTHORIZED
    );
  }

  // Check if user registered via Google
  if (user.provider === AuthProviders.GOOGLE && !user.password) {
    throw new AppError(
      "This account uses Google sign-in. Please login with Google.",
      HttpStatus.BAD_REQUEST
    );
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError(
      ErrorMessages.INVALID_CREDENTIALS,
      HttpStatus.UNAUTHORIZED
    );
  }

  // Generate tokens
  const tokens = await createSession(
    user._id.toString(),
    userAgent,
    ipAddress
  );

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return { user, tokens };
};

// ===== LOGOUT =====
export const logout = async (refreshToken: string): Promise<void> => {
  if (refreshToken) {
    await Session.findOneAndDelete({ refreshToken: hashToken(refreshToken) });
  }
};

// ===== REFRESH TOKEN =====
export const refresh = async (
  oldRefreshToken: string,
  userAgent: string,
  ipAddress: string
): Promise<AuthTokens> => {
  if (!oldRefreshToken) {
    throw new AppError(ErrorMessages.INVALID_TOKEN, HttpStatus.UNAUTHORIZED);
  }

  // Verify the refresh token JWT
  let decoded: { userId: string };
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch {
    throw new AppError(ErrorMessages.INVALID_TOKEN, HttpStatus.UNAUTHORIZED);
  }

  // Find and delete the old session (token rotation)
  const hashedOldToken = hashToken(oldRefreshToken);
  const session = await Session.findOneAndDelete({
    refreshToken: hashedOldToken,
  });

  if (!session) {
    // Possible token reuse detected — invalidate ALL sessions for this user
    await Session.deleteMany({ userId: decoded.userId });
    throw new AppError(
      "Session expired. Please login again.",
      HttpStatus.UNAUTHORIZED
    );
  }

  // Create new session with rotated tokens
  const tokens = await createSession(decoded.userId, userAgent, ipAddress);

  return tokens;
};

// ===== VERIFY EMAIL =====
export const verifyEmail = async (token: string): Promise<IUser> => {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError(ErrorMessages.INVALID_TOKEN, HttpStatus.BAD_REQUEST);
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // Send welcome email
  await sendWelcomeEmail(user.email, user.name);

  return user;
};

// ===== FORGOT PASSWORD =====
export const forgotPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });

  // Don't reveal whether user exists — always return success
  if (!user) return;

  // Generate reset token
  const rawToken = generateRandomToken();
  const hashedToken = hashToken(rawToken);

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(
    Date.now() + TokenExpiry.PASSWORD_RESET
  );
  await user.save({ validateBeforeSave: false });

  // Send reset email
  await sendPasswordResetEmail(email, user.name, rawToken);
};

// ===== RESET PASSWORD =====
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError(ErrorMessages.INVALID_TOKEN, HttpStatus.BAD_REQUEST);
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  // Invalidate all sessions (force re-login)
  await Session.deleteMany({ userId: user._id });
};

// ===== GOOGLE AUTH =====
export const googleAuth = async (
  googleId: string,
  email: string,
  name: string,
  avatar: string,
  userAgent: string,
  ipAddress: string
): Promise<AuthResult> => {
  let user = await User.findOne({
    $or: [{ googleId }, { email }],
  });

  if (user) {
    // Link Google account if not already linked
    if (!user.googleId) {
      user.googleId = googleId;
      user.provider = AuthProviders.GOOGLE;
    }
    if (avatar && !user.avatar.includes("dicebear")) {
      user.avatar = avatar;
    }
    user.isVerified = true;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
  } else {
    // Create new user
    user = await User.create({
      name,
      email,
      googleId,
      avatar,
      provider: AuthProviders.GOOGLE,
      isVerified: true,
      lastLogin: new Date(),
    });
  }

  const tokens = await createSession(
    user._id.toString(),
    userAgent,
    ipAddress
  );

  return { user, tokens };
};

// ===== HELPER: CREATE SESSION =====
const createSession = async (
  userId: string,
  userAgent: string,
  ipAddress: string
): Promise<AuthTokens> => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  await Session.create({
    userId,
    refreshToken: hashToken(refreshToken),
    userAgent,
    ipAddress,
    expiresAt: new Date(Date.now() + TokenExpiry.REFRESH_TOKEN),
  });

  return { accessToken, refreshToken };
};
