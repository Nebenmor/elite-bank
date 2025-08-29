import express, { Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { User } from "../models/User";
import { Transaction } from "../models/Transaction";

const router = express.Router();

// Get current user info
router.get("/profile", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Profile request for user:", req.userId);
    
    if (!req.userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    console.log("Profile found for user:", user.accountNumber);

    res.json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      accountNumber: user.accountNumber,
      balance: user.balance,
      beneficiaries: user.beneficiaries,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Search user by account number
router.get("/search/:accountNumber", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountNumber } = req.params;

    console.log("User search request:", { accountNumber, searcherId: req.userId });

    if (!accountNumber || accountNumber.length !== 10) {
      res.status(400).json({ message: "Invalid account number format" });
      return;
    }

    const user = await User.findOne({ accountNumber }).select(
      "fullName accountNumber"
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Don't allow searching for self
    if (req.user && user.accountNumber === req.user.accountNumber) {
      res.status(400).json({ message: "Cannot search for your own account" });
      return;
    }

    console.log("User found:", user.fullName);

    res.json({
      fullName: user.fullName,
      accountNumber: user.accountNumber,
    });
  } catch (error) {
    console.error("User search error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add beneficiary
router.post("/beneficiaries", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountNumber, name, nickname } = req.body;

    console.log("Add beneficiary request:", { accountNumber, name, nickname, userId: req.userId });

    if (!accountNumber || !name) {
      res.status(400).json({ message: "Account number and name are required" });
      return;
    }

    if (accountNumber.length !== 10) {
      res.status(400).json({ message: "Invalid account number format" });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if beneficiary limit reached
    if (user.beneficiaries.length >= 10) {
      res.status(400).json({ message: "Maximum 10 beneficiaries allowed" });
      return;
    }

    // Check if beneficiary already exists
    const existingBeneficiary = user.beneficiaries.find(
      (b) => b.accountNumber === accountNumber
    );
    if (existingBeneficiary) {
      res.status(400).json({ message: "Beneficiary already exists" });
      return;
    }

    // Verify the beneficiary exists
    const beneficiaryUser = await User.findOne({ accountNumber }).select(
      "fullName"
    );
    if (!beneficiaryUser) {
      res.status(404).json({ message: "Beneficiary account not found" });
      return;
    }

    // Don't allow adding self as beneficiary
    if (accountNumber === user.accountNumber) {
      res.status(400).json({ message: "Cannot add yourself as beneficiary" });
      return;
    }

    // Add beneficiary
    user.beneficiaries.push({
      accountNumber,
      name: name.trim(),
      nickname: nickname?.trim(),
    });

    await user.save();

    console.log("Beneficiary added successfully");

    res.json({
      message: "Beneficiary added successfully",
      beneficiaries: user.beneficiaries,
    });
  } catch (error) {
    console.error("Add beneficiary error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove beneficiary
router.delete("/beneficiaries/:accountNumber", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountNumber } = req.params;

    console.log("Remove beneficiary request:", { accountNumber, userId: req.userId });

    if (!req.userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const beneficiaryIndex = user.beneficiaries.findIndex(
      (b) => b.accountNumber === accountNumber
    );
    if (beneficiaryIndex === -1) {
      res.status(404).json({ message: "Beneficiary not found" });
      return;
    }

    user.beneficiaries.splice(beneficiaryIndex, 1);
    await user.save();

    console.log("Beneficiary removed successfully");

    res.json({
      message: "Beneficiary removed successfully",
      beneficiaries: user.beneficiaries,
    });
  } catch (error) {
    console.error("Remove beneficiary error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get transaction history
router.get("/transactions", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Transaction history request for user:", req.userId);

    if (!req.userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const transactions = await Transaction.find({
      $or: [{ from: user.accountNumber }, { to: user.accountNumber }],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`Found ${transactions.length} transactions for user`);

    res.json(transactions);
  } catch (error) {
    console.error("Transaction history error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;