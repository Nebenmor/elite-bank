import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { userAPI, transactionAPI } from "../utils/api";
import type { SearchedUser, Beneficiary } from "../types";
import { Search, Send, Users, ArrowLeft, Zap, Wallet, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const Transfer: React.FC = () => {
  const { user, updateBalance } = useAuth();
  const [searchAccountNumber, setSearchAccountNumber] = useState("");
  const [searchedUser, setSearchedUser] = useState<SearchedUser | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] =
    useState<Beneficiary | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showQuickTransfer, setShowQuickTransfer] = useState(false);

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const loadBeneficiaries = async (): Promise<void> => {
    try {
      const userData = await userAPI.getProfile();
      setBeneficiaries(userData.beneficiaries || []);
    } catch (error) {
      console.error("Failed to load beneficiaries:", error);
    }
  };

  const handleSearch = async (): Promise<void> => {
    if (!searchAccountNumber || searchAccountNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit account number");
      return;
    }

    setSearchLoading(true);
    try {
      const user = await userAPI.searchUser(searchAccountNumber);
      setSearchedUser(user);
      setSelectedBeneficiary(null);
      setShowQuickTransfer(false);
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      toast.error(err.response?.data?.message || "User not found");
      setSearchedUser(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleTransfer = async (): Promise<void> => {
    if (!searchedUser || !amount) {
      toast.error("Please select a recipient and enter amount");
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!user || transferAmount > user.balance) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      const result = await transactionAPI.transfer({
        toAccountNumber: searchedUser.accountNumber,
        amount: transferAmount,
        description: description || undefined,
      });

      updateBalance(result.newBalance);
      toast.success("Transfer successful!");

      // Reset form
      setSearchAccountNumber("");
      setSearchedUser(null);
      setAmount("");
      setDescription("");
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      toast.error(err.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTransfer = async (): Promise<void> => {
    if (!selectedBeneficiary || !amount) {
      toast.error("Please select a beneficiary and enter amount");
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!user || transferAmount > user.balance) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      const result = await transactionAPI.quickTransfer({
        beneficiaryAccountNumber: selectedBeneficiary.accountNumber,
        amount: transferAmount,
        description: description || undefined,
      });

      updateBalance(result.newBalance);
      toast.success("Quick transfer successful!");

      // Reset form
      setSelectedBeneficiary(null);
      setAmount("");
      setDescription("");
      setShowQuickTransfer(false);
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      toast.error(err.response?.data?.message || "Quick transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const selectBeneficiary = (beneficiary: Beneficiary): void => {
    setSelectedBeneficiary(beneficiary);
    setSearchedUser(null);
    setShowQuickTransfer(true);
    setSearchAccountNumber("");
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (!user) return null;

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Send Money</h1>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <Wallet className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Available Balance:</span>
              <span className="text-sm font-bold text-blue-600">{formatCurrency(user.balance)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Transfer Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Transfer Type Selector */}
              {beneficiaries.length > 0 && (
                <div className="p-6 border-b border-gray-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setShowQuickTransfer(false);
                        setSelectedBeneficiary(null);
                        setSearchedUser(null);
                      }}
                      className={`flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        !showQuickTransfer
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search Recipient
                    </button>
                    <button
                      onClick={() => {
                        setShowQuickTransfer(true);
                        setSearchedUser(null);
                        setSearchAccountNumber("");
                      }}
                      className={`flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        showQuickTransfer
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Quick Transfer
                    </button>
                  </div>
                </div>
              )}

              <div className="p-6">
                {!showQuickTransfer ? (
                  <>
                    {/* Search User Section */}
                    <div className="mb-8">
                      <label 
                        htmlFor="search-account-number"
                        className="block text-sm font-semibold text-gray-700 mb-3"
                      >
                        Search by Account Number
                      </label>
                      <div className="flex space-x-3">
                        <div className="flex-1 relative">
                          <input
                            id="search-account-number"
                            type="text"
                            value={searchAccountNumber}
                            onChange={(e) =>
                              setSearchAccountNumber(
                                e.target.value.replace(/\D/g, "").slice(0, 10)
                              )
                            }
                            placeholder="Enter 10-digit account number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                            maxLength={10}
                          />
                        </div>
                        <button
                          onClick={handleSearch}
                          disabled={
                            searchLoading || searchAccountNumber.length !== 10
                          }
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                          aria-label="Search user"
                        >
                          {searchLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <Search className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      {searchedUser && (
                        <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                          <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-full mr-4">
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-green-900">
                                {searchedUser.fullName}
                              </p>
                              <p className="text-sm text-green-700 font-mono">
                                {searchedUser.accountNumber}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Quick Transfer - Beneficiary Selection */}
                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Select Beneficiary
                      </label>
                      {selectedBeneficiary ? (
                        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="p-3 bg-blue-100 rounded-full mr-4">
                                <Users className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-blue-900">
                                  {selectedBeneficiary.nickname ||
                                    selectedBeneficiary.name}
                                </p>
                                <p className="text-sm text-blue-700 font-mono">
                                  {selectedBeneficiary.accountNumber}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedBeneficiary(null)}
                              className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                              aria-label="Deselect beneficiary"
                            >
                              <ArrowLeft className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {beneficiaries.map((beneficiary) => (
                            <button
                              key={beneficiary.accountNumber}
                              onClick={() => selectBeneficiary(beneficiary)}
                              className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            >
                              <div className="flex items-center">
                                <div className="p-3 bg-gray-100 rounded-full mr-4">
                                  <Users className="h-5 w-5 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {beneficiary.nickname || beneficiary.name}
                                  </p>
                                  <p className="text-sm text-gray-600 font-mono">
                                    {beneficiary.accountNumber}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Transfer Amount and Description */}
                {(searchedUser || selectedBeneficiary) && (
                  <div className="space-y-6">
                    {/* Amount Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-gray-500 font-semibold">
                          ₦
                        </span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          min="0.01"
                          max={user.balance}
                          className="w-full pl-10 pr-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Maximum: {formatCurrency(user.balance)}
                      </p>
                    </div>

                    {/* Description Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What's this transfer for?"
                        maxLength={100}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                      />
                    </div>

                    {/* Transfer Button */}
                    <button
                      onClick={
                        selectedBeneficiary ? handleQuickTransfer : handleTransfer
                      }
                      disabled={loading || !amount}
                      className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <Send className="h-6 w-6 mr-3" />
                          {selectedBeneficiary ? "Send Quick Transfer" : "Send Money"}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Beneficiaries Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Quick Access</h3>
                <Users className="h-5 w-5 text-blue-600" />
              </div>

              {beneficiaries.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm mb-4">No saved beneficiaries</p>
                  <p className="text-xs text-gray-400">Add beneficiaries for faster transfers</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {beneficiaries.slice(0, 4).map((beneficiary) => (
                    <button
                      key={beneficiary.accountNumber}
                      className="w-full text-left p-3 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={() => selectBeneficiary(beneficiary)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {beneficiary.nickname || beneficiary.name}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            {beneficiary.accountNumber}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}

                  {beneficiaries.length > 4 && (
                    <p className="text-xs text-gray-400 text-center pt-2">
                      +{beneficiaries.length - 4} more beneficiaries
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfer;