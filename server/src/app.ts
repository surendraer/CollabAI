import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import config from "./config";
import routes from "./routes";
import errorHandler from "./middleware/errorHandler";
import AppError from "./utils/AppError";
import { HttpStatus } from "./constants";

const app = express();

// ===== Security Middleware =====

// Helmet — secure HTTP headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: "error",
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    status: "error",
    message: "Too many authentication attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

// ===== Body Parsers =====
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ===== Data Sanitization =====
app.use(mongoSanitize());
app.use(hpp());

// ===== HTTP Logging =====
if (config.isDevelopment) {
  app.use(morgan("dev"));
}

// ===== Routes =====
app.use("/api", routes);

// ===== 404 Handler =====
app.all("*", (req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, HttpStatus.NOT_FOUND));
});

// ===== Global Error Handler =====
app.use(errorHandler);

export default app;
