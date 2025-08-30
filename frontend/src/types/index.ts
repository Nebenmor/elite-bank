export interface User {
  id: string;
  email: string;
  fullName: string;
  accountNumber: string;
  balance: number;
}

export interface Beneficiary {
  accountNumber: string;
  name: string;
  nickname?: string;
}

export interface Transaction {
  _id: string;
  from: string;
  to: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface SearchedUser {
  fullName: string;
  accountNumber: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateBalance: (newBalance: number) => void;
}

export interface TransferData {
  toAccountNumber: string;
  amount: number;
  description?: string;
}

export interface QuickTransferData {
  beneficiaryAccountNumber: string;
  amount: number;
  description?: string;
}