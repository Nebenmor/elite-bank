import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./utils/database";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import transactionRoutes from "./routes/transaction";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.FRONTEND_URL].filter((url): url is string => Boolean(url))
    : ["http://localhost:3000", "http://localhost:5173"];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Request logging middleware (Phase 2: Debug route connectivity)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  console.log(`Headers:`, {
    "content-type":
      req.headers["content-type"] || "N/A (normal for GET requests)",
    authorization: req.headers.authorization ? "Bearer [PRESENT]" : "[MISSING]",
    origin: req.headers.origin || "N/A",
  });

  if (req.body && Object.keys(req.body).length > 0) {
    // Log body but mask password
    const logBody = { ...req.body };
    if (logBody.password) logBody.password = "[MASKED]";
    console.log(`Body:`, logBody);
  }

  next();
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes with logging
console.log("Registering routes...");

app.use(
  "/api/auth",
  (req, res, next) => {
    console.log(`Auth route hit: ${req.method} ${req.path}`);
    next();
  },
  authRoutes
);

app.use(
  "/api/user",
  (req, res, next) => {
    console.log(`User route hit: ${req.method} ${req.path}`);
    next();
  },
  userRoutes
);

app.use(
  "/api/transaction",
  (req, res, next) => {
    console.log(`Transaction route hit: ${req.method} ${req.path}`);
    next();
  },
  transactionRoutes
);

console.log("Routes registered successfully");

// Health check
app.get("/api/health", (req, res) => {
  console.log("Health check accessed");
  res.json({
    message: "Banking API is running!",
    timestamp: new Date().toISOString(),
    cors: corsOptions.origin,
    nodeEnv: process.env.NODE_ENV || "development",
  });
});

// FIXED: Catch all unmatched routes using named parameter
app.use("/*path", (req, res) => {
  console.log(`Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error middleware triggered:");
    console.error("Error stack:", err.stack);
    console.error("Request details:", {
      method: req.method,
      path: req.path,
      body: req.body,
      headers: {
        "content-type": req.headers["content-type"],
        authorization: req.headers.authorization
          ? "Bearer [PRESENT]"
          : "[MISSING]",
      },
    });

    res.status(err.status || 500).json({
      message: err.message || "Something went wrong!",
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
  }
);

// Start server
const startServer = async () => {
  try {
    console.log("Starting server initialization...");

    // Connect to database first
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected successfully");

    // Verify required environment variables
    const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
    const missingEnvVars = requiredEnvVars.filter(
      (envVar) => !process.env[envVar]
    );

    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(", ")}`
      );
    }

    console.log("Environment variables verified");

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        `📱 CORS enabled for origins: ${JSON.stringify(corsOptions.origin)}`
      );
      console.log(
        `🔒 JWT Secret: ${process.env.JWT_SECRET ? "SET" : "MISSING"}`
      );
      console.log(
        `💾 MongoDB: ${process.env.MONGODB_URI ? "CONFIGURED" : "MISSING"}`
      );
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`⚡ Server ready to accept connections`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
