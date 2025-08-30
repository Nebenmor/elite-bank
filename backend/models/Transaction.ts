import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  from: string;
  to: string;
  amount: number;
  description: string;
  createdAt: Date;
}

const TransactionSchema = new Schema({
  from: {
    type: String,
    required: true,
    length: 10,
  },
  to: {
    type: String,
    required: true,
    length: 10,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 100,
    default: "Money transfer",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance (no duplicates here)
TransactionSchema.index({ from: 1 });
TransactionSchema.index({ to: 1 });
TransactionSchema.index({ createdAt: -1 });
// Compound index for better query performance
TransactionSchema.index({ from: 1, createdAt: -1 });
TransactionSchema.index({ to: 1, createdAt: -1 });

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);
