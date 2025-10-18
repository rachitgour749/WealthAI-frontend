import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import Navigation from './Navigation';

const ProfilePage = ({ setCurrentPage, currentPage, hideHeaderFooter = false }) => {
  const { user, updateUserProfile } = useAuth();
  const { subscriptionInfo, daysRemaining, needsUpgrade } = useSubscription();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
    role: user?.role || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    updateUserProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      company: user?.company || '',
      role: user?.role || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className={hideHeaderFooter ? "min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" : "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"}>
      {!hideHeaderFooter && <Navigation setCurrentPage={setCurrentPage} currentPage={currentPage} />}
      
      {/* Hero Section with 3D Background */}
      <div className={hideHeaderFooter ? "py-8 relative overflow-hidden" : "pt-20 lg:pt-24 pb-8 relative overflow-hidden"}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-teal-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              My Profile
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage your account information and preferences
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Profile Card */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                {/* Card Header with 3D Effect */}
                <div className="relative p-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-t-3xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90 rounded-t-3xl"></div>
                  <div className="relative flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    {/* 3D Letter Avatar */}
                    <div className="relative group">
                      {/* Outer glow ring */}
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                      
                      {/* Middle glow ring */}
                      <div className="absolute inset-2 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 rounded-full blur-lg opacity-60 group-hover:opacity-80 transition-opacity animate-pulse delay-200"></div>
                      
                      {/* 3D Avatar Container */}
                      <div className="relative w-24 h-24 rounded-full border-4 border-white/50 shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                        {/* Inner gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                        
                        {/* 3D Letter */}
                        <span className="relative text-3xl font-black text-white drop-shadow-2xl transform transition-all duration-500 group-hover:scale-125 group-hover:rotate-6" 
                              style={{
                                textShadow: '0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
                                filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
                              }}>
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                        
                        {/* Shine effect */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000 ease-in-out"></div>
                        
                        {/* Bottom highlight */}
                        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent rounded-b-full"></div>
                      </div>
                      
                      {/* Floating particles */}
                      <div className="absolute top-0 left-0 w-2 h-2 bg-white/60 rounded-full animate-ping delay-300"></div>
                      <div className="absolute top-2 right-1 w-1 h-1 bg-blue-300/80 rounded-full animate-ping delay-700"></div>
                      <div className="absolute bottom-3 left-2 w-1.5 h-1.5 bg-purple-300/70 rounded-full animate-ping delay-1000"></div>
                    </div>
                    <div className="text-center sm:text-left text-white">
                      <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
                      <p className="text-blue-100 mb-1">Member since {new Date(user.loginTime).toLocaleDateString()}</p>
                      <div className="flex items-center justify-center sm:justify-start space-x-2">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                          {user.provider === 'google' ? '🔗 Google' : user.provider}
                        </span>
                      </div>
                    </div>
                    <div className="sm:ml-auto">
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/30"
                      >
                        {isEditing ? '✕ Cancel' : '✏️ Edit Profile'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Profile Form with 3D Cards */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <span className="mr-2">👤</span>
                        Full Name
                      </label>
                      <div className="relative">
                        {isEditing ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 transform hover:scale-105"
                          />
                        ) : (
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 rounded-xl border-2 border-gray-100 shadow-inner">
                            <p className="text-gray-900 font-medium">{user.name}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <span className="mr-2">📧</span>
                        Email Address
                      </label>
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 rounded-xl border-2 border-gray-100 shadow-inner">
                        <p className="text-gray-900 font-medium">{user.email}</p>
                        <span className="text-xs text-green-600 flex items-center mt-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Verified
                        </span>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <span className="mr-2">📱</span>
                        Phone Number
                      </label>
                      <div className="relative">
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter your phone number"
                            className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 transform hover:scale-105"
                          />
                        ) : (
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 rounded-xl border-2 border-gray-100 shadow-inner">
                            <p className="text-gray-900 font-medium">{user.phone || 'Not provided'}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Company */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <span className="mr-2">🏢</span>
                        Company
                      </label>
                      <div className="relative">
                        {isEditing ? (
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="Enter your company"
                            className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 transform hover:scale-105"
                          />
                        ) : (
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 rounded-xl border-2 border-gray-100 shadow-inner">
                            <p className="text-gray-900 font-medium">{user.company || 'Not provided'}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Role */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <span className="mr-2">💼</span>
                        Role/Position
                      </label>
                      <div className="relative">
                        {isEditing ? (
                          <input
                            type="text"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            placeholder="Enter your role"
                            className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 transform hover:scale-105"
                          />
                        ) : (
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 rounded-xl border-2 border-gray-100 shadow-inner">
                            <p className="text-gray-900 font-medium">{user.role || 'Not provided'}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Account Type */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <span className="mr-2">🔐</span>
                        Account Type
                      </label>
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 rounded-xl border-2 border-gray-100 shadow-inner">
                        <p className="text-gray-900 font-medium capitalize flex items-center">
                          {user.provider === 'google' && <span className="mr-2">🔗</span>}
                          Google Account
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-8 pt-8 border-t border-gray-200">
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        💾 Save Changes
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Subscription Status Card */}
            <div className="space-y-6">
              {/* Subscription Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">💎</span>
                    Subscription Status
                  </h3>
                  
                  {subscriptionInfo ? (
                    <div className="space-y-4">
                      {/* Status Badge */}
                      <div className="flex items-center justify-center">
                        {subscriptionInfo.isTrialActive && daysRemaining > 0 ? (
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-full shadow-lg">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                              <span className="font-semibold">Trial Active</span>
                            </div>
                          </div>
                        ) : subscriptionInfo.canAccessPremium ? (
                          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full shadow-lg">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-white rounded-full"></div>
                              <span className="font-semibold">Premium</span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full shadow-lg">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                              <span className="font-semibold">Expired</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Days Remaining */}
                      {subscriptionInfo.isTrialActive && daysRemaining > 0 && (
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-2">{daysRemaining}</div>
                          <div className="text-gray-600">days remaining</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(daysRemaining / 30) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      {needsUpgrade && (
                        <button
                          onClick={() => setCurrentPage('payment')}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          🚀 Upgrade Now
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>Loading subscription info...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📊</span>
                    Quick Stats
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                      <span className="text-gray-700">Account Age</span>
                      <span className="font-semibold text-blue-600">
                        {Math.floor((new Date() - new Date(user.loginTime)) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <span className="text-gray-700">Login Method</span>
                      <span className="font-semibold text-green-600 capitalize">
                        {user.provider}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                      <span className="text-gray-700">Profile Status</span>
                      <span className="font-semibold text-purple-600">
                        {(user.phone && user.company && user.role) ? 'Complete' : 'Incomplete'}
                      </span>
                    </div>
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

export default ProfilePage;
