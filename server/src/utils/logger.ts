import winston from "winston";
import config from "../config";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  format
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// File transports only in production
if (config.isProduction) {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format,
    })
  );
}

const logger = winston.createLogger({
  level: config.isDevelopment ? "debug" : "info",
  levels,
  transports,
});

export default logger;
