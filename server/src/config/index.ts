import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  MONGODB_URI: z.string().default("memory"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().default("587"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("CollabAI <noreply@collabai.dev>"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  GEMINI_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const config = {
  port: parseInt(parsed.data.PORT, 10),
  nodeEnv: parsed.data.NODE_ENV,
  isProduction: parsed.data.NODE_ENV === "production",
  isDevelopment: parsed.data.NODE_ENV === "development",

  db: {
    uri: parsed.data.MONGODB_URI,
  },

  jwt: {
    secret: parsed.data.JWT_SECRET,
    refreshSecret: parsed.data.JWT_REFRESH_SECRET,
    accessExpiry: parsed.data.JWT_ACCESS_EXPIRY,
    refreshExpiry: parsed.data.JWT_REFRESH_EXPIRY,
  },

  resend: {
    apiKey: parsed.data.RESEND_API_KEY || "",
  },

  smtp: {
    host: parsed.data.SMTP_HOST || "",
    port: parseInt(parsed.data.SMTP_PORT, 10),
    user: parsed.data.SMTP_USER || "",
    pass: parsed.data.SMTP_PASS || "",
    from: parsed.data.SMTP_FROM,
  },

  google: {
    clientId: parsed.data.GOOGLE_CLIENT_ID || "",
    clientSecret: parsed.data.GOOGLE_CLIENT_SECRET || "",
  },

  clientUrl: parsed.data.CLIENT_URL,
  gemini: {
    apiKey: parsed.data.GEMINI_API_KEY || "",
  },
} as const;

export default config;
