import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { userAPI, transactionAPI } from "../utils/api";
import type { SearchedUser, Beneficiary } from "../types";
import { Search, Send, Users, ArrowLeft, Zap } from "lucide-react";
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
    }).format(amount);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Send Money</h1>
        <p className="text-gray-600">
          Available Balance: {formatCurrency(user.balance)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Transfer Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
            {/* Quick Transfer Toggle */}
            {beneficiaries.length > 0 && (
              <div className="flex space-x-2 md:space-x-4 mb-4 md:mb-6">
                <button
                  onClick={() => {
                    setShowQuickTransfer(false);
                    setSelectedBeneficiary(null);
                    setSearchedUser(null);
                  }}
                  className={`flex items-center px-3 md:px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    !showQuickTransfer
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Search className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Search User</span>
                  <span className="sm:hidden">Search</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickTransfer(true);
                    setSearchedUser(null);
                    setSearchAccountNumber("");
                  }}
                  className={`flex items-center px-3 md:px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    showQuickTransfer
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Quick Transfer</span>
                  <span className="sm:hidden">Quick</span>
                </button>
              </div>
            )}

            {!showQuickTransfer ? (
              <>
                {/* Search User */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label
                      htmlFor="search-account-number"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Search by Account Number
                    </label>
                    <div className="flex space-x-2">
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={10}
                      />
                      <button
                        onClick={handleSearch}
                        disabled={
                          searchLoading || searchAccountNumber.length !== 10
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                        aria-label="Search user"
                      >
                        {searchLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {searchedUser && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-full mr-3 flex-shrink-0">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-green-900 truncate">
                            {searchedUser.fullName}
                          </p>
                          <p className="text-sm text-green-700">
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
                <div className="mb-6">
                  <label
                    htmlFor="beneficiary-selection"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Select Beneficiary
                  </label>
                  {selectedBeneficiary ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0 flex-1">
                          <div className="p-2 bg-blue-100 rounded-full mr-3 flex-shrink-0">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-blue-900 truncate">
                              {selectedBeneficiary.nickname ||
                                selectedBeneficiary.name}
                            </p>
                            <p className="text-sm text-blue-700">
                              {selectedBeneficiary.accountNumber}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedBeneficiary(null)}
                          className="text-blue-600 hover:text-blue-800 ml-2 flex-shrink-0 transition-colors"
                          aria-label="Deselect beneficiary"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="space-y-2 max-h-60 overflow-y-auto"
                      id="beneficiary-selection"
                    >
                      {beneficiaries.map((beneficiary) => (
                        <button
                          key={beneficiary.accountNumber}
                          onClick={() => selectBeneficiary(beneficiary)}
                          className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="p-2 bg-gray-100 rounded-full mr-3 flex-shrink-0">
                              <Users className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {beneficiary.nickname || beneficiary.name}
                              </p>
                              <p className="text-sm text-gray-600">
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
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="transfer-amount"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">
                      ₦
                    </span>
                    <input
                      id="transfer-amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0.01"
                      max={user.balance}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="transfer-description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description (Optional)
                  </label>
                  <input
                    id="transfer-description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this for?"
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={
                    selectedBeneficiary ? handleQuickTransfer : handleTransfer
                  }
                  disabled={loading || !amount}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      {selectedBeneficiary ? "Quick Transfer" : "Send Money"}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Beneficiaries Sidebar */}
        <div className="lg:block">
          <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
              Saved Beneficiaries
            </h3>

            {beneficiaries.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No saved beneficiaries</p>
              </div>
            ) : (
              <div className="space-y-3">
                {beneficiaries.slice(0, 5).map((beneficiary) => (
                  <button
                    key={beneficiary.accountNumber}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    onClick={() => selectBeneficiary(beneficiary)}
                  >
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {beneficiary.nickname || beneficiary.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {beneficiary.accountNumber}
                    </p>
                  </button>
                ))}

                {beneficiaries.length > 5 && (
                  <p className="text-xs text-gray-400 text-center">
                    +{beneficiaries.length - 5} more
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfer;