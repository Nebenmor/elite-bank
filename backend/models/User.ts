import mongoose, { Schema, Document } from "mongoose";

interface IBeneficiary {
  accountNumber: string;
  name: string;
  nickname?: string;
}

export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  accountNumber: string;
  balance: number;
  beneficiaries: IBeneficiary[];
  createdAt: Date;
}

const BeneficiarySchema = new Schema({
  accountNumber: {
    type: String,
    required: true,
    length: 10,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  nickname: {
    type: String,
    trim: true,
  },
});

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    // Removed unique: true to avoid duplicate index
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  accountNumber: {
    type: String,
    required: true,
    // Removed unique: true to avoid duplicate index
    length: 10,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  beneficiaries: {
    type: [BeneficiarySchema],
    validate: {
      validator: function (beneficiaries: IBeneficiary[]) {
        return beneficiaries.length <= 10;
      },
      message: "Cannot have more than 10 beneficiaries",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Use schema.index() with unique option instead
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ accountNumber: 1 }, { unique: true });

export const User = mongoose.model<IUser>("User", UserSchema);