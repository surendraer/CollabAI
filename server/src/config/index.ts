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
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().default("587"),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_FROM_ADDRESS: z.string().optional(),
  EMAIL_FROM_NAME: z.string().default("GenBot"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  GEMINI_API_KEY: z.string().optional(),
  PUSHER_APP_ID: z.string().optional(),
  PUSHER_KEY: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),
  PUSHER_CLUSTER: z.string().default("mt1"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const config = {
  port: parseInt(parsed.data.PORT, 10) || 5000,
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
    host: parsed.data.EMAIL_HOST || "",
    port: parseInt(parsed.data.EMAIL_PORT, 10),
    user: parsed.data.EMAIL_USER || "",
    pass: parsed.data.EMAIL_PASS || "",
    from: parsed.data.EMAIL_FROM_ADDRESS
      ? `"${parsed.data.EMAIL_FROM_NAME}" <${parsed.data.EMAIL_FROM_ADDRESS}>`
      : `"${parsed.data.EMAIL_FROM_NAME}" <noreply@collabai.dev>`,
  },

  google: {
    clientId: parsed.data.GOOGLE_CLIENT_ID || "",
    clientSecret: parsed.data.GOOGLE_CLIENT_SECRET || "",
  },

  clientUrl: parsed.data.CLIENT_URL,
  gemini: {
    apiKey: parsed.data.GEMINI_API_KEY || "",
  },
  pusher: {
    appId: parsed.data.PUSHER_APP_ID || "",
    key: parsed.data.PUSHER_KEY || "",
    secret: parsed.data.PUSHER_SECRET || "",
    cluster: parsed.data.PUSHER_CLUSTER,
  },
  cloudinary: {
    cloudName: parsed.data.CLOUDINARY_CLOUD_NAME || "",
    apiKey: parsed.data.CLOUDINARY_API_KEY || "",
    apiSecret: parsed.data.CLOUDINARY_API_SECRET || "",
  },
} as const;

export default config;
