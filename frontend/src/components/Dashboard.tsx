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
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await userAPI.getTransactions();
      setTransactions(data.slice(0, 3)); // Show only recent 3 transactions
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderLoadingSkeletons = () => (
    <div className="space-y-2">
      {Array.from({ length: 2 }, (_, i) => (
        <div key={`transaction-loading-${i}`} className="animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-gray-200 h-8 w-8"></div>
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyTransactions = () => (
    <div className="text-center py-4">
      <div className="mx-auto h-8 w-8 text-gray-400 mb-2">
        <CreditCard className="h-8 w-8" />
      </div>
      <h3 className="text-gray-900 font-medium mb-1 text-sm">No transactions yet</h3>
      <p className="text-gray-500 mb-3 text-xs">Start by sending money to someone</p>
      <Link
        to="/transfer"
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        <Send className="h-3 w-3 mr-1" />
        Send Money
      </Link>
    </div>
  );

  const renderTransactionsList = () => (
    <div className="space-y-2">
      {transactions.slice(0, 2).map((transaction) => {
        const isOutgoing = transaction.from === user.accountNumber;
        return (
          <div
            key={transaction._id}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div
                className={`p-1.5 rounded-full flex-shrink-0 ${
                  isOutgoing
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {isOutgoing ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownLeft className="h-3 w-3" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-900 truncate">
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
    <div className="h-full flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
      {/* Welcome Section - Compact */}
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-lg md:text-xl font-bold text-gray-900">
          Welcome back, {user.fullName}
        </h1>
        <p className="text-gray-600 text-xs md:text-sm">Here's your account overview</p>
      </div>

      {/* Account Info Card - Compact */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 md:p-5 text-white mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <CreditCard className="h-5 md:h-6 w-5 md:w-6 mr-2" />
            <div>
              <h3 className="text-sm md:text-base font-semibold">Current Account</h3>
              <p className="text-blue-100 text-xs">{user.accountNumber}</p>
            </div>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-white hover:text-blue-100 p-1"
            aria-label={showBalance ? "Hide balance" : "Show balance"}
          >
            {showBalance ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="mb-3 md:mb-4">
          <p className="text-blue-100 text-xs mb-1">Available Balance</p>
          <p className="text-xl md:text-2xl font-bold">
            {showBalance ? formatCurrency(user.balance) : "****"}
          </p>
        </div>

        {/* Quick Actions - Compact */}
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <Link
            to="/transfer"
            className="bg-white/25 hover:bg-white/30 rounded-lg p-2 md:p-3 text-center transition-all flex flex-col items-center"
          >
            <Send className="h-4 md:h-5 w-4 md:w-5 mb-1" />
            <p className="text-xs font-medium text-white">Send Money</p>
          </Link>
          <Link
            to="/beneficiaries"
            className="bg-white/25 hover:bg-white/30 rounded-lg p-2 md:p-3 text-center transition-all flex flex-col items-center"
          >
            <Users className="h-4 md:h-5 w-4 md:w-5 mb-1" />
            <p className="text-xs font-medium text-white">Beneficiaries</p>
          </Link>
        </div>
      </div>

      {/* Recent Transactions - Flexible height */}
      <div className="bg-white rounded-xl shadow-sm border flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between p-3 md:p-4 border-b flex-shrink-0">
          <h2 className="text-sm md:text-base font-semibold text-gray-900">
            Recent Transactions
          </h2>
          <Link
            to="/transfer"
            className="text-blue-600 hover:text-blue-700 text-xs font-medium"
          >
            View All
          </Link>
        </div>
        
        <div className="flex-1 p-3 md:p-4 overflow-y-auto min-h-0">
          {loading && renderLoadingSkeletons()}
          {!loading && transactions.length === 0 && renderEmptyTransactions()}
          {!loading && transactions.length > 0 && renderTransactionsList()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;