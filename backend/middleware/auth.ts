import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/helpers";
import { User, IUser } from "../models/User";

// Extend the Express Request interface (consolidated here)
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: IUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      res.status(401).json({ message: "No authorization header provided" });
      return;
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token || token === "null" || token === "undefined") {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded?.userId) {
      res.status(401).json({ message: "Invalid token format" });
      return;
    }

    // Find user
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const userIdString = user._id.toString();
    req.userId = userIdString;
    req.user = user;

    next();
  } catch (error: any) {
    console.error("Authentication error:", error);

    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    if (error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Token expired" });
      return;
    }

    res.status(401).json({ message: "Authentication failed" });
  }
};
