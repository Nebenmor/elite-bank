import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import type { Transaction } from '../types';
import { CreditCard, Send, Users, Eye, EyeOff, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

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
      setTransactions(data.slice(0, 5)); // Show only recent 5 transactions
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderLoadingSkeletons = () => (
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

  const renderEmptyTransactions = () => (
    <div className="text-center py-12">
      <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
        <CreditCard className="h-12 w-12" />
      </div>
      <h3 className="text-gray-900 font-medium mb-1">No transactions yet</h3>
      <p className="text-gray-500 mb-4">Start by sending money to someone</p>
      <Link
        to="/transfer"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        <Send className="h-4 w-4 mr-2" />
        Send Money
      </Link>
    </div>
  );

  const renderTransactionsList = () => (
    <div className="space-y-4">
      {transactions.map((transaction) => {
        const isOutgoing = transaction.from === user.accountNumber;
        return (
          <div
            key={transaction._id}
            className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                isOutgoing 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-green-100 text-green-600'
              }`}>
                {isOutgoing ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownLeft className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {isOutgoing ? `To: ${transaction.to}` : `From: ${transaction.from}`}
                </p>
                <p className="text-xs text-gray-500">
                  {transaction.description}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(transaction.createdAt)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${
                isOutgoing ? 'text-red-600' : 'text-green-600'
              }`}>
                {isOutgoing ? '-' : '+'}{formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.fullName}
        </h1>
        <p className="text-gray-600">Here's your account overview</p>
      </div>

      {/* Account Info Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Current Account</h3>
              <p className="text-blue-100 text-sm">{user.accountNumber}</p>
            </div>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-white hover:text-blue-100"
          >
            {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-blue-100 text-sm mb-1">Available Balance</p>
          <p className="text-3xl font-bold">
            {showBalance ? formatCurrency(user.balance) : '****'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/transfer"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <Send className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm font-medium">Send Money</p>
          </Link>
          <Link
            to="/beneficiaries"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <Users className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm font-medium">Beneficiaries</p>
          </Link>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <Link
            to="/transfer"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
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