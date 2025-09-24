import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../utils/api";
import type { Transaction } from "../types";
import {
  Send,
  Users,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await userAPI.getTransactions();
      setTransactions(data.slice(0, 5)); // Show 5 recent transactions
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyAccountNumber = async () => {
    if (!user?.accountNumber) return;

    try {
      await navigator.clipboard.writeText(user.accountNumber);
      setCopied(true);
      toast.success("Account number copied to clipboard!");

      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback method that's more modern
      try {
        const textArea = document.createElement("textarea");
        textArea.value = user.accountNumber;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.body.removeChild(textArea);

        setCopied(true);
        toast.success("Account number copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Failed to copy account number");
      }
    }
  };

  if (!user) return null;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderLoadingSkeletons = () => (
    <div className="space-y-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={`transaction-loading-${i}`} className="animate-pulse">
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyTransactions = () => (
    <div className="text-center py-6">
      <div className="mx-auto h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
        <TrendingUp className="h-6 w-6 text-blue-600" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">
        No transactions yet
      </h3>
      <p className="text-gray-600 text-sm mb-4 max-w-xs mx-auto">
        Start your financial journey by sending money
      </p>
      <Link
        to="/transfer"
        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg text-sm"
      >
        <Send className="h-4 w-4 mr-2" />
        Send Money
      </Link>
    </div>
  );

  const renderTransactionsList = () => (
    <div className="space-y-2">
      {transactions.map((transaction) => {
        const isOutgoing = transaction.from === user.accountNumber;
        return (
          <div
            key={transaction._id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div
                className={`p-2 rounded-full flex-shrink-0 ${
                  isOutgoing
                    ? "bg-red-50 text-red-600 border border-red-100"
                    : "bg-green-50 text-green-600 border border-green-100"
                }`}
              >
                {isOutgoing ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownLeft className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {isOutgoing
                    ? `To: ${transaction.to}`
                    : `From: ${transaction.from}`}
                </p>
                {transaction.description && (
                  <p className="text-xs text-gray-600 truncate mt-0.5">
                    {transaction.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDate(transaction.createdAt)}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p
                className={`text-sm font-semibold ${
                  isOutgoing ? "text-red-600" : "text-green-600"
                }`}
              >
                {isOutgoing ? "-" : "+"}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="inset-0 pt-16 bg-gradient-to-br from-gray-50 to-blue-50/30 overflow-hidden lg:relative lg:min-h-screen lg:overflow-auto lg:inset-auto">
      <div className="h-full flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:h-auto">
        {/* Welcome Section - Fixed */}
        <div className="flex-shrink-0 mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">
                Welcome back, {user.fullName.split(" ")[0]}
              </h1>
              <p className="text-gray-600 text-xs md:text-sm">
                Here's your account overview
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 min-h-0 lg:overflow-auto lg:flex-initial">
          <div className="h-full flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:h-auto">
            {/* Main Account Card */}
            <div className="lg:col-span-2 flex-shrink-0">
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl p-4 md:p-6 text-white shadow-xl relative overflow-hidden h-80">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>

                <div className="relative h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">Elite Bank</h3>
                        <p className="text-blue-100 text-xs">Premium Account</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm"
                      aria-label={showBalance ? "Hide balance" : "Show balance"}
                    >
                      {showBalance ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Account Number with Copy Button */}
                  <div className="mb-4">
                    <p className="text-blue-100 text-xs mb-2">Account Number</p>
                    <div className="flex items-center justify-between bg-white/10 rounded-lg p-2 md:p-3 backdrop-blur-sm">
                      <p className="font-mono text-white font-medium text-sm">
                        {user.accountNumber}
                      </p>
                      <button
                        onClick={copyAccountNumber}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors group"
                        aria-label="Copy account number"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-300" />
                        ) : (
                          <Copy className="h-4 w-4 text-white group-hover:text-blue-200" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="mb-4">
                    <p className="text-blue-100 text-xs mb-1">
                      Available Balance
                    </p>
                    <p className="text-xl md:text-2xl font-bold">
                      {showBalance ? formatCurrency(user.balance) : "••••••••"}
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <Link
                      to="/transfer"
                      className="bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-lg p-3 text-center transition-all duration-200 transform hover:scale-105 border border-white/20"
                    >
                      <Send className="h-4 w-4 mb-1 mx-auto" />
                      <p className="text-xs font-semibold">Send Money</p>
                    </Link>
                    <Link
                      to="/beneficiaries"
                      className="bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-lg p-3 text-center transition-all duration-200 transform hover:scale-105 border border-white/20"
                    >
                      <Users className="h-4 w-4 mb-1 mx-auto" />
                      <p className="text-xs font-semibold">Beneficiaries</p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions - Scrollable on Mobile */}
            <div className="lg:col-span-1 flex-1 min-h-0 lg:flex-initial">
              <div className="bg-white rounded-xl shadow-xl border border-gray-100 h-full max-h-full flex flex-col lg:h-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
                  <h2 className="text-base font-bold text-gray-900">
                    Recent Activity
                  </h2>
                  {/* <Link
                    to="/transactions" 
                    className="text-blue-600 hover:text-blue-700 text-xs font-semibold hover:underline"
                  >
                    View All
                  </Link> */}
                </div>

                {/* Scrollable content area */}
                <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-visible lg:flex-initial">
                  <div className="p-4">
                    {loading && renderLoadingSkeletons()}
                    {!loading &&
                      transactions.length === 0 &&
                      renderEmptyTransactions()}
                    {!loading &&
                      transactions.length > 0 &&
                      renderTransactionsList()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
