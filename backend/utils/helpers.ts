import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

// Generate unique 10-digit account number
export const generateAccountNumber = async (): Promise<string> => {
  while (true) {
    // Generate 10-digit number
    const accountNumber = Math.floor(
      1000000000 + Math.random() * 9000000000
    ).toString();

    // Check if it already exists
    const existingUser = await User.findOne({ accountNumber });
    if (!existingUser) {
      return accountNumber;
    }
  }
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (userId: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const isValidPassword = (password: string): boolean => {
  // At least 6 characters
  return password.length >= 6;
};
