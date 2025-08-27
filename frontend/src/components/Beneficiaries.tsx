import React, { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';
import type { Beneficiary } from '../types';
import { Users, Plus, Trash2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface SearchedUser {
  accountNumber: string;
  fullName: string;
}

const Beneficiaries: React.FC = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchAccountNumber, setSearchAccountNumber] = useState('');
  const [searchedUser, setSearchedUser] = useState<SearchedUser | null>(null);
  const [nickname, setNickname] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const loadBeneficiaries = async () => {
    try {
      const userData = await userAPI.getProfile();
      setBeneficiaries(userData.beneficiaries || []);
    } catch (error) {
      console.error('Failed to load beneficiaries:', error);
      toast.error('Failed to load beneficiaries');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchAccountNumber || searchAccountNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit account number');
      return;
    }

    // Check if user is already a beneficiary
    const existingBeneficiary = beneficiaries.find(b => b.accountNumber === searchAccountNumber);
    if (existingBeneficiary) {
      toast.error('This user is already in your beneficiaries');
      return;
    }

    setSearchLoading(true);
    try {
      const user = await userAPI.searchUser(searchAccountNumber);
      setSearchedUser(user);
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'User not found';
      toast.error(errorMessage);
      setSearchedUser(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddBeneficiary = async () => {
    if (!searchedUser) {
      toast.error('Please search for a user first');
      return;
    }

    if (beneficiaries.length >= 10) {
      toast.error('Maximum 10 beneficiaries allowed');
      return;
    }

    setAddLoading(true);
    try {
      await userAPI.addBeneficiary(
        searchedUser.accountNumber,
        searchedUser.fullName,
        nickname.trim() || undefined
      );
      
      toast.success('Beneficiary added successfully!');
      await loadBeneficiaries();
      handleCloseModal();
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to add beneficiary';
      toast.error(errorMessage);
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveBeneficiary = async (accountNumber: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from your beneficiaries?`)) {
      return;
    }

    try {
      await userAPI.removeBeneficiary(accountNumber);
      toast.success('Beneficiary removed successfully!');
      await loadBeneficiaries();
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to remove beneficiary';
      toast.error(errorMessage);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setSearchAccountNumber('');
    setSearchedUser(null);
    setNickname('');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={`loading-skeleton-${i}`} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Beneficiaries</h1>
          <p className="text-gray-600">
            Manage your saved beneficiaries ({beneficiaries.length}/10)
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          disabled={beneficiaries.length >= 10}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Beneficiary
        </button>
      </div>

      {/* Beneficiaries Grid */}
      {beneficiaries.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
            <Users className="h-16 w-16" />
          </div>
          <h3 className="text-gray-900 font-medium mb-2">No beneficiaries yet</h3>
          <p className="text-gray-500 mb-6">
            Add beneficiaries to make quick transfers easier
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Beneficiary
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beneficiaries.map((beneficiary) => (
            <div
              key={beneficiary.accountNumber}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <button
                  onClick={() => handleRemoveBeneficiary(beneficiary.accountNumber, beneficiary.name)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">
                  {beneficiary.nickname || beneficiary.name}
                </h3>
                {beneficiary.nickname && (
                  <p className="text-sm text-gray-600">{beneficiary.name}</p>
                )}
                <p className="text-sm text-gray-500 font-mono">
                  {beneficiary.accountNumber}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Beneficiary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Add Beneficiary
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Search User */}
              <div>
                <label htmlFor="account-search" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <div className="flex space-x-2">
                  <input
                    id="account-search"
                    type="text"
                    value={searchAccountNumber}
                    onChange={(e) => setSearchAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit account number"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={10}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={searchLoading || searchAccountNumber.length !== 10}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {searchLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Search Result */}
              {searchedUser && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-full mr-3">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">
                        {searchedUser.fullName}
                      </p>
                      <p className="text-sm text-green-700">
                        {searchedUser.accountNumber}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Nickname */}
              {searchedUser && (
                <div>
                  <label htmlFor="nickname-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Nickname (Optional)
                  </label>
                  <input
                    id="nickname-input"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g., Mom, John, Best Friend"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={50}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Give this beneficiary a memorable nickname
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBeneficiary}
                  disabled={addLoading || !searchedUser}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {addLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Beneficiary
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Beneficiaries;