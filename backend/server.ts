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

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/transaction", transactionRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Banking API is running!" });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  }
);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
