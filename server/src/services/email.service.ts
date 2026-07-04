import nodemailer from "nodemailer";
import { Resend } from "resend";
import config from "../config";
import logger from "../utils/logger";

const resend = config.resend.apiKey ? new Resend(config.resend.apiKey) : null;

const transporter = config.smtp.host
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: config.smtp.user && config.smtp.pass
        ? {
            user: config.smtp.user,
            pass: config.smtp.pass,
          }
        : undefined,
      connectionTimeout: 5000, // 5 seconds connection timeout
      greetingTimeout: 5000, // 5 seconds greeting timeout
      socketTimeout: 10000, // 10 seconds socket activity timeout
    })
  : null;

if (transporter) {
  transporter.verify((error) => {
    if (error) {
      logger.error("❌ SMTP transporter configuration error:", error);
    } else {
      logger.info("📧 SMTP transporter verified successfully — ready to send emails");
    }
  });
}

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: config.smtp.from,
        to,
        subject,
        html,
      });
      logger.info(`📧 Email sent via SMTP to ${to}: ${subject}`);
      return;
    } catch (error) {
      logger.error(`Failed to send email via SMTP to ${to}:`, error);
    }
  }

  if (resend) {
    try {
      await resend.emails.send({
        from: "CollabAI <onboarding@resend.dev>",
        to,
        subject,
        html,
      });
      logger.info(`📧 Email sent via Resend to ${to}: ${subject}`);
      return;
    } catch (error) {
      logger.error(`Failed to send email via Resend to ${to}:`, error);
    }
  }

  logger.warn(
    `📧 Email not sent (no SMTP or Resend credentials). To: ${to}, Subject: ${subject}`
  );
  logger.debug(`Email HTML content:\n${html}`);
};

export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const verifyUrl = `${config.clientUrl}/verify-email/${token}`;

  if (config.nodeEnv === "development") {
    logger.info(`🔑 [DEV-ONLY] Verification Link for ${email}: ${verifyUrl}`);
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f0f23; color: #e2e8f0; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 40px auto; background: #1a1a2e; border-radius: 12px; padding: 40px; border: 1px solid #2d2d44; }
        .logo { text-align: center; margin-bottom: 32px; }
        .logo h1 { color: #818cf8; font-size: 28px; margin: 0; }
        h2 { color: #f1f5f9; font-size: 22px; margin-bottom: 16px; }
        p { color: #94a3b8; line-height: 1.6; font-size: 15px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 24px 0; }
        .footer { text-align: center; margin-top: 32px; color: #64748b; font-size: 13px; }
        .divider { height: 1px; background: #2d2d44; margin: 24px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo"><h1>⚡ CollabAI</h1></div>
        <h2>Verify your email</h2>
        <p>Hey ${name},</p>
        <p>Welcome to CollabAI! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center;">
          <a href="${verifyUrl}" class="btn">Verify Email Address</a>
        </div>
        <div class="divider"></div>
        <p style="font-size: 13px;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="font-size: 13px; word-break: break-all; color: #818cf8;">${verifyUrl}</p>
        <p style="font-size: 13px;">This link expires in 24 hours.</p>
        <div class="footer">
          <p>CollabAI — AI-Powered Collaboration</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(email, "Verify your email — CollabAI", html);
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const resetUrl = `${config.clientUrl}/reset-password/${token}`;

  if (config.nodeEnv === "development") {
    logger.info(`🔑 [DEV-ONLY] Password Reset Link for ${email}: ${resetUrl}`);
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f0f23; color: #e2e8f0; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 40px auto; background: #1a1a2e; border-radius: 12px; padding: 40px; border: 1px solid #2d2d44; }
        .logo { text-align: center; margin-bottom: 32px; }
        .logo h1 { color: #818cf8; font-size: 28px; margin: 0; }
        h2 { color: #f1f5f9; font-size: 22px; margin-bottom: 16px; }
        p { color: #94a3b8; line-height: 1.6; font-size: 15px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 24px 0; }
        .footer { text-align: center; margin-top: 32px; color: #64748b; font-size: 13px; }
        .divider { height: 1px; background: #2d2d44; margin: 24px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo"><h1>⚡ CollabAI</h1></div>
        <h2>Reset your password</h2>
        <p>Hey ${name},</p>
        <p>We received a request to reset your password. Click the button below to choose a new one:</p>
        <div style="text-align: center;">
          <a href="${resetUrl}" class="btn">Reset Password</a>
        </div>
        <div class="divider"></div>
        <p style="font-size: 13px;">If you didn't request a password reset, you can safely ignore this email.</p>
        <p style="font-size: 13px;">This link expires in 1 hour.</p>
        <div class="footer">
          <p>CollabAI — AI-Powered Collaboration</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(email, "Reset your password — CollabAI", html);
};

export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f0f23; color: #e2e8f0; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 40px auto; background: #1a1a2e; border-radius: 12px; padding: 40px; border: 1px solid #2d2d44; }
        .logo { text-align: center; margin-bottom: 32px; }
        .logo h1 { color: #818cf8; font-size: 28px; margin: 0; }
        h2 { color: #f1f5f9; font-size: 22px; margin-bottom: 16px; }
        p { color: #94a3b8; line-height: 1.6; font-size: 15px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 24px 0; }
        .footer { text-align: center; margin-top: 32px; color: #64748b; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo"><h1>⚡ CollabAI</h1></div>
        <h2>Welcome to CollabAI! 🎉</h2>
        <p>Hey ${name},</p>
        <p>Your email has been verified and your account is ready to go. Start collaborating with your team using AI-powered tools.</p>
        <div style="text-align: center;">
          <a href="${config.clientUrl}/dashboard" class="btn">Go to Dashboard</a>
        </div>
        <div class="footer">
          <p>CollabAI — AI-Powered Collaboration</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(email, "Welcome to CollabAI! 🎉", html);
};
