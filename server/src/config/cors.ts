import config from "./index";

const allowedOrigins = config.clientUrl
  ? config.clientUrl.split(",").map((o) => o.trim())
  : [];

// Add default local client origin
if (!allowedOrigins.includes("http://localhost:5173")) {
  allowedOrigins.push("http://localhost:5173");
}

/**
 * Validator function for CORS origin requests
 */
export const checkOrigin = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
): void => {
  // Allow requests with no origin (like mobile apps, curl, postman, etc.)
  if (!origin) {
    callback(null, true);
    return;
  }

  const isAllowed =
    allowedOrigins.some((allowed) => {
      if (allowed === "*") return true;
      return allowed.toLowerCase() === origin.toLowerCase();
    }) || origin.endsWith(".vercel.app");

  if (isAllowed) {
    callback(null, true);
  } else {
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  }
};
