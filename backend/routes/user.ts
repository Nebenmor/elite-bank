import express from "express";
import { authenticate } from "../middleware/auth";
import { User } from "../models/User";
import { Transaction } from "../models/Transaction";

const router = express.Router();

// Get current user info
router.get("/profile", authenticate, async (req: any, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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
router.get("/search/:accountNumber", authenticate, async (req: any, res) => {
  try {
    const { accountNumber } = req.params;

    if (!accountNumber || accountNumber.length !== 10) {
      return res.status(400).json({ message: "Invalid account number format" });
    }

    const user = await User.findOne({ accountNumber }).select(
      "fullName accountNumber"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't allow searching for self
    if (user.accountNumber === req.user.accountNumber) {
      return res
        .status(400)
        .json({ message: "Cannot search for your own account" });
    }

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
router.post("/beneficiaries", authenticate, async (req: any, res) => {
  try {
    const { accountNumber, name, nickname } = req.body;

    if (!accountNumber || !name) {
      return res
        .status(400)
        .json({ message: "Account number and name are required" });
    }

    if (accountNumber.length !== 10) {
      return res.status(400).json({ message: "Invalid account number format" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if beneficiary limit reached
    if (user.beneficiaries.length >= 10) {
      return res
        .status(400)
        .json({ message: "Maximum 10 beneficiaries allowed" });
    }

    // Check if beneficiary already exists
    const existingBeneficiary = user.beneficiaries.find(
      (b) => b.accountNumber === accountNumber
    );
    if (existingBeneficiary) {
      return res.status(400).json({ message: "Beneficiary already exists" });
    }

    // Verify the beneficiary exists
    const beneficiaryUser = await User.findOne({ accountNumber }).select(
      "fullName"
    );
    if (!beneficiaryUser) {
      return res.status(404).json({ message: "Beneficiary account not found" });
    }

    // Don't allow adding self as beneficiary
    if (accountNumber === user.accountNumber) {
      return res
        .status(400)
        .json({ message: "Cannot add yourself as beneficiary" });
    }

    // Add beneficiary
    user.beneficiaries.push({
      accountNumber,
      name: name.trim(),
      nickname: nickname?.trim(),
    });

    await user.save();

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
router.delete(
  "/beneficiaries/:accountNumber",
  authenticate,
  async (req: any, res) => {
    try {
      const { accountNumber } = req.params;

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const beneficiaryIndex = user.beneficiaries.findIndex(
        (b) => b.accountNumber === accountNumber
      );
      if (beneficiaryIndex === -1) {
        return res.status(404).json({ message: "Beneficiary not found" });
      }

      user.beneficiaries.splice(beneficiaryIndex, 1);
      await user.save();

      res.json({
        message: "Beneficiary removed successfully",
        beneficiaries: user.beneficiaries,
      });
    } catch (error) {
      console.error("Remove beneficiary error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get transaction history
router.get("/transactions", authenticate, async (req: any, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const transactions = await Transaction.find({
      $or: [{ from: user.accountNumber }, { to: user.accountNumber }],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(transactions);
  } catch (error) {
    console.error("Transaction history error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
