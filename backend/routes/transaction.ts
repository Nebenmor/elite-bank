import express from "express";
import mongoose from "mongoose";
import { authenticate } from "../middleware/auth";
import { User } from "../models/User";
import { Transaction } from "../models/Transaction";

const router = express.Router();

// Transfer money
router.post("/transfer", authenticate, async (req: any, res) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const { toAccountNumber, amount, description } = req.body;

      // Validation
      if (!toAccountNumber || !amount) {
        throw new Error("Recipient account number and amount are required");
      }

      if (toAccountNumber.length !== 10) {
        throw new Error("Invalid recipient account number format");
      }

      const transferAmount = parseFloat(amount);
      if (isNaN(transferAmount) || transferAmount <= 0) {
        throw new Error("Invalid transfer amount");
      }

      if (transferAmount < 0.01) {
        throw new Error("Minimum transfer amount is 0.01");
      }

      // Get sender
      const sender = await User.findById(req.userId).session(session);
      if (!sender) {
        throw new Error("Sender not found");
      }

      // Check if sender has sufficient balance
      if (sender.balance < transferAmount) {
        throw new Error("Insufficient balance");
      }

      // Get recipient
      const recipient = await User.findOne({
        accountNumber: toAccountNumber,
      }).session(session);
      if (!recipient) {
        throw new Error("Recipient account not found");
      }

      // Prevent self-transfer
      if (sender.accountNumber === recipient.accountNumber) {
        throw new Error("Cannot transfer money to yourself");
      }

      // Update balances
      sender.balance -= transferAmount;
      recipient.balance += transferAmount;

      // Save users
      await sender.save({ session });
      await recipient.save({ session });

      // Create transaction record
      const transaction = new Transaction({
        from: sender.accountNumber,
        to: recipient.accountNumber,
        amount: transferAmount,
        description: description?.trim() || "Money transfer",
      });

      await transaction.save({ session });

      res.json({
        message: "Transfer successful",
        transaction: {
          id: transaction._id,
          from: transaction.from,
          to: transaction.to,
          amount: transaction.amount,
          description: transaction.description,
          createdAt: transaction.createdAt,
        },
        newBalance: sender.balance,
      });
    });
  } catch (error: any) {
    console.error("Transfer error:", error);
    res.status(400).json({
      message: error.message || "Transfer failed",
    });
  } finally {
    await session.endSession();
  }
});

// Quick transfer to beneficiary
router.post("/quick-transfer", authenticate, async (req: any, res) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const { beneficiaryAccountNumber, amount, description } = req.body;

      // Validation
      if (!beneficiaryAccountNumber || !amount) {
        throw new Error("Beneficiary account number and amount are required");
      }

      const transferAmount = parseFloat(amount);
      if (isNaN(transferAmount) || transferAmount <= 0) {
        throw new Error("Invalid transfer amount");
      }

      if (transferAmount < 0.01) {
        throw new Error("Minimum transfer amount is 0.01");
      }

      // Get sender
      const sender = await User.findById(req.userId).session(session);
      if (!sender) {
        throw new Error("Sender not found");
      }

      // Check if account is in beneficiaries
      const beneficiary = sender.beneficiaries.find(
        (b) => b.accountNumber === beneficiaryAccountNumber
      );
      if (!beneficiary) {
        throw new Error("Account not found in your beneficiaries");
      }

      // Check if sender has sufficient balance
      if (sender.balance < transferAmount) {
        throw new Error("Insufficient balance");
      }

      // Get recipient
      const recipient = await User.findOne({
        accountNumber: beneficiaryAccountNumber,
      }).session(session);
      if (!recipient) {
        throw new Error("Beneficiary account not found");
      }

      // Update balances
      sender.balance -= transferAmount;
      recipient.balance += transferAmount;

      // Save users
      await sender.save({ session });
      await recipient.save({ session });

      // Create transaction record
      const transaction = new Transaction({
        from: sender.accountNumber,
        to: recipient.accountNumber,
        amount: transferAmount,
        description: description?.trim() || `Transfer to ${beneficiary.name}`,
      });

      await transaction.save({ session });

      res.json({
        message: "Quick transfer successful",
        transaction: {
          id: transaction._id,
          from: transaction.from,
          to: transaction.to,
          amount: transaction.amount,
          description: transaction.description,
          createdAt: transaction.createdAt,
        },
        newBalance: sender.balance,
      });
    });
  } catch (error: any) {
    console.error("Quick transfer error:", error);
    res.status(400).json({
      message: error.message || "Quick transfer failed",
    });
  } finally {
    await session.endSession();
  }
});

export default router;
