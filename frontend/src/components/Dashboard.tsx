import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../utils/api";
import type { Transaction } from "../types";
import {
  CreditCard,
  Send,
  Users,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async (): Promise<void> => {
    try {
      const data = await userAPI.getTransactions();
      setTransactions(data.slice(0, 5)); // Show only recent 5 transactions
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
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

  const renderLoadingSkeletons = (): JSX.Element => (
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={`transaction-loading-${i}`} className="animate-pulse">
          <div className="flex items-center space-x-4">
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

  const renderEmptyTransactions = (): JSX.Element => (
    <div className="text-center py-8">
      <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
        <CreditCard className="h-12 w-12" />
      </div>
      <h3 className="text-gray-900 font-medium mb-1">No transactions yet</h3>
      <p className="text-gray-500 mb-4">Start by sending money to someone</p>
      <Link
        to="/transfer"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
      >
        <Send className="h-4 w-4 mr-2" />
        Send Money
      </Link>
    </div>
  );

  const renderTransactionsList = (): JSX.Element => (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const isOutgoing = transaction.from === user.accountNumber;
        return (
          <div
            key={transaction._id}
            className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div
                className={`p-2 rounded-full flex-shrink-0 ${
                  isOutgoing
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
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
                  <p className="text-xs text-gray-500 truncate">
                    {transaction.description}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  {formatDate(transaction.createdAt)}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* Welcome Section */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Welcome back, {user.fullName}
        </h1>
        <p className="text-gray-600">Here's your account overview</p>
      </div>

      {/* Account Info Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 md:p-6 text-white mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CreditCard className="h-6 md:h-8 w-6 md:w-8 mr-3" />
            <div>
              <h3 className="text-base md:text-lg font-semibold">Current Account</h3>
              <p className="text-blue-100 text-xs md:text-sm">{user.accountNumber}</p>
            </div>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-white hover:text-blue-100 transition-colors"
          >
            {showBalance ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="mb-4 md:mb-6">
          <p className="text-blue-100 text-xs md:text-sm mb-1">Available Balance</p>
          <p className="text-2xl md:text-3xl font-bold">
            {showBalance ? formatCurrency(user.balance) : "****"}
          </p>
        </div>

        {/* Quick Actions - Hidden on mobile since we have bottom nav */}
        <div className="hidden md:grid grid-cols-2 gap-4">
          <Link
            to="/transfer"
            className="bg-white/25 hover:bg-white/30 rounded-lg p-4 text-center transition-all flex flex-col items-center"
          >
            <Send className="h-6 w-6 mb-2" />
            <p className="text-sm font-medium text-white">Send Money</p>
          </Link>
          <Link
            to="/beneficiaries"
            className="bg-white/25 hover:bg-white/30 rounded-lg p-4 text-center transition-all flex flex-col items-center"
          >
            <Users className="h-6 w-6 mb-2" />
            <p className="text-sm font-medium text-white">Beneficiaries</p>
          </Link>
        </div>

        {/* Mobile Quick Actions */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          <Link
            to="/transfer"
            className="bg-white/25 hover:bg-white/30 rounded-lg p-3 text-center transition-all flex items-center justify-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span className="text-sm font-medium text-white">Send</span>
          </Link>
          <Link
            to="/beneficiaries"
            className="bg-white/25 hover:bg-white/30 rounded-lg p-3 text-center transition-all flex items-center justify-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium text-white">Beneficiaries</span>
          </Link>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">
            Recent Transactions
          </h2>
          <Link
            to="/transfer"
            className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            <span className="hidden sm:inline">View All</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {loading && renderLoadingSkeletons()}
        {!loading && transactions.length === 0 && renderEmptyTransactions()}
        {!loading && transactions.length > 0 && renderTransactionsList()}
      </div>
    </div>
  );
};

export default Dashboard;