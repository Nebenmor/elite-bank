import axios from "axios";
import type {
  User,
  Beneficiary,
  Transaction,
  SearchedUser,
  TransferData,
  QuickTransferData,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(new Error(error.message || "Request failed"));
  }
);

// Auth APIs
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  signup: async (email: string, password: string, fullName: string) => {
    const response = await api.post("/auth/signup", {
      email,
      password,
      fullName,
    });
    return response.data;
  },
};

// User APIs
export const userAPI = {
  getProfile: async (): Promise<User & { beneficiaries: Beneficiary[] }> => {
    const response = await api.get("/user/profile");
    return response.data;
  },

  searchUser: async (accountNumber: string): Promise<SearchedUser> => {
    const response = await api.get(`/user/search/${accountNumber}`);
    return response.data;
  },

  addBeneficiary: async (
    accountNumber: string,
    name: string,
    nickname?: string
  ) => {
    const response = await api.post("/user/beneficiaries", {
      accountNumber,
      name,
      nickname,
    });
    return response.data;
  },

  removeBeneficiary: async (accountNumber: string) => {
    const response = await api.delete(`/user/beneficiaries/${accountNumber}`);
    return response.data;
  },

  getTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get("/user/transactions");
    return response.data;
  },
};

// Transaction APIs
export const transactionAPI = {
  transfer: async (data: TransferData) => {
    const response = await api.post("/transaction/transfer", data);
    return response.data;
  },

  quickTransfer: async (data: QuickTransferData) => {
    const response = await api.post("/transaction/quick-transfer", data);
    return response.data;
  },
};
