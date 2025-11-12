import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PaymentPopup from './Payments/PaymentPopup';
import { formatDate } from '../utils/dateFormatter';

const UserAvatar = ({ setCurrentPage }) => {
  const { user, logout, updateUserProfile } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '+91');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const dropdownRef = useRef(null);

  // Update phone number when user data changes
  useEffect(() => {
    if (user?.phone) {
      setPhoneNumber(user.phone);
    }
  }, [user?.phone]);

  // Array of 3D gradient color combinations - Updated for soft blue-purple aesthetic
  const colorSchemes = [
    {
      light: 'from-blue-400 to-purple-500',
      dark: 'from-blue-500 to-purple-600',
      shadow: 'shadow-blue-400/30',
      glow: 'shadow-purple-400/20'
    },
    {
      light: 'from-indigo-400 to-purple-500',
      dark: 'from-indigo-500 to-purple-600',
      shadow: 'shadow-indigo-400/30',
      glow: 'shadow-purple-400/20'
    },
    {
      light: 'from-blue-300 to-indigo-400',
      dark: 'from-blue-400 to-indigo-500',
      shadow: 'shadow-blue-300/30',
      glow: 'shadow-indigo-300/20'
    },
    {
      light: 'from-purple-300 to-blue-400',
      dark: 'from-purple-400 to-blue-500',
      shadow: 'shadow-purple-300/30',
      glow: 'shadow-blue-300/20'
    },
    {
      light: 'from-violet-400 to-blue-500',
      dark: 'from-violet-500 to-blue-600',
      shadow: 'shadow-violet-400/30',
      glow: 'shadow-blue-400/20'
    },
    {
      light: 'from-blue-400 to-violet-500',
      dark: 'from-blue-500 to-violet-600',
      shadow: 'shadow-blue-400/30',
      glow: 'shadow-violet-400/20'
    },
    {
      light: 'from-indigo-300 to-purple-400',
      dark: 'from-indigo-400 to-purple-500',
      shadow: 'shadow-indigo-300/30',
      glow: 'shadow-purple-300/20'
    },
    {
      light: 'from-blue-300 to-purple-400',
      dark: 'from-blue-400 to-purple-500',
      shadow: 'shadow-blue-300/30',
      glow: 'shadow-purple-300/20'
    }
  ];

  // Function to get color scheme based on user name
  const getColorScheme = (name) => {
    if (!name) return colorSchemes[0];
    const index = name.charCodeAt(0) % colorSchemes.length;
    return colorSchemes[index];
  };

  // Function to get first letter of user name
  const getFirstLetter = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  // Function to get user profile picture or null
  const getUserProfilePicture = (user) => {
    return user?.picture || user?.photoURL || user?.avatar || null;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    // Redirect to home page after logout
    window.location.href = '/';
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    setIsProfilePopupOpen(true);
  };

  const handlePaymentClick = () => {
    setIsDropdownOpen(false);
    setIsPaymentPopupOpen(true);
  };


  const handleSavePhoneNumber = async () => {
    if (!phoneNumber || phoneNumber === '+91') {
      setSaveMessage('Please enter a valid phone number');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      await updateUserProfile({ phone: phoneNumber });
      setSaveMessage('Phone number saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving phone number:', error);
      setSaveMessage('Failed to save phone number. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  const colorScheme = getColorScheme(user.name);
  const firstLetter = getFirstLetter(user.name);
  const profilePicture = getUserProfilePicture(user);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100/80 transition-all duration-300 group"
      >
                 {/* Soft Professional 3D Avatar */}
         <div className="relative">
           {/* Subtle outer glow effect */}
           <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${colorScheme.light} blur-md opacity-25 group-hover:opacity-35 transition-opacity duration-300 ${colorScheme.glow}`}></div>
           
           {/* Main avatar with soft 3D effect */}
           <div className={`relative w-8 h-8 rounded-full ${profilePicture ? 'bg-white' : `bg-gradient-to-br ${colorScheme.light}`} flex justify-center items-center text-white font-semibold text-[16px] shadow-lg ${colorScheme.shadow} border border-white/20 backdrop-blur-sm transform transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 group-hover:shadow-xl group-hover:shadow-black/20 overflow-hidden`}>
             {profilePicture ? (
               /* Profile Picture */
               <img 
                 src={profilePicture} 
                 alt={user.name || 'User'} 
                 className="w-full h-full object-cover rounded-full"
                 onError={(e) => {
                   // Fallback to letter if image fails to load
                   e.target.style.display = 'none';
                   e.target.nextSibling.style.display = 'flex';
                 }}
               />
             ) : null}
             
             {/* Fallback letter display */}
             <div className={`${profilePicture ? 'hidden' : 'flex'} absolute inset-0 justify-center items-center`}>
               {/* Soft inner highlight for gentle 3D effect */}
               <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/25 via-white/10 to-transparent"></div>
               
               {/* Text with subtle drop shadow */}
               <span className="relative z-10 drop-shadow-sm font-medium">{firstLetter}</span>
             </div>
             
             {/* Soft bottom shadow for gentle depth */}
             <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-black/15 rounded-full blur-sm"></div>
           </div>
         </div>

                 {/* Subtle Professional Dropdown arrow */}
         <div className="relative">
           <svg
             className={`w-4 h-4 text-gray-600 transition-all duration-300 transform ${
               isDropdownOpen ? 'rotate-180' : ''
             } group-hover:text-gray-700 drop-shadow-sm`}
             fill="none"
             stroke="currentColor"
             viewBox="0 0 24 24"
           >
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
           </svg>
         </div>
      </button>

             {isDropdownOpen && (
         <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 z-50 transform transition-all duration-300 animate-in slide-in-from-top-2">
           {/* 3D Dropdown shadow */}
           <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-900/5 to-transparent -z-10"></div>
                     {/* User Info Section - Enhanced 3D */}
           <div className="px-4 py-4 border-b border-gray-100/50 text-center">
             <div className="flex flex-col items-center space-y-4">
               {/* Large 3D Avatar */}
               <div className="relative">
                 {/* Outer glow for large avatar */}
                 <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${colorScheme.light} blur-lg opacity-40 ${colorScheme.glow}`}></div>
                 
                 {/* Main large avatar */}
                 <div className={`relative w-20 h-20 rounded-full ${profilePicture ? 'bg-white' : `bg-gradient-to-br ${colorScheme.light}`} flex justify-center items-center text-white font-bold text-3xl shadow-2xl ${colorScheme.shadow} border-4 border-white/30 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30 overflow-hidden`}>
                   {profilePicture ? (
                     /* Profile Picture */
                     <img 
                       src={profilePicture} 
                       alt={user.name || 'User'} 
                       className="w-full h-full object-cover rounded-full"
                       onError={(e) => {
                         // Fallback to letter if image fails to load
                         e.target.style.display = 'none';
                         e.target.nextSibling.style.display = 'flex';
                       }}
                     />
                   ) : null}
                   
                   {/* Fallback letter display */}
                   <div className={`${profilePicture ? 'hidden' : 'flex'} absolute inset-0 justify-center items-center`}>
                     {/* Inner highlight */}
                     <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-white/10 to-transparent"></div>
                     
                     {/* Text with enhanced drop shadow */}
                     <span className="relative z-10 drop-shadow-lg">{firstLetter}</span>
                   </div>
                   
                   {/* Bottom shadow for depth */}
                   <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-black/30 rounded-full blur-md"></div>
                 </div>
               </div>
               
               <div>
                 <p className="text-lg font-bold text-gray-900 drop-shadow-sm">{user.name}</p>
                 <p className="text-sm text-gray-500 mt-1">Sync and personalise across your devices</p>
               </div>
             </div>
           </div>

                     {/* Menu Items with 3D effects */}
           <div className="">
             <button
               onClick={handleProfileClick}
               className="w-full px-6 py-3 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 flex items-center space-x-3 transition-all duration-200 group/item"
             >
               <div className="relative">
                 <svg className="w-5 h-5 text-gray-500 group-hover/item:text-blue-600 transition-colors duration-200 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                 </svg>
               </div>
               <span className="font-medium group-hover/item:text-blue-900 transition-colors duration-200">My Profile</span>
             </button>

             <button
               onClick={handlePaymentClick}
               className="w-full px-6 py-3 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 flex items-center space-x-3 transition-all duration-200 group/item"
             >
               <div className="relative">
                 <svg className="w-5 h-5 text-gray-500 group-hover/item:text-green-600 transition-colors duration-200 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                 </svg>
               </div>
               <span className="font-medium group-hover/item:text-green-900 transition-colors duration-200">Payment</span>
             </button>

             <div className="border-t border-gray-100/50 "></div>

             <button
               onClick={handleLogout}
               className="w-full px-6 py-3 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 flex items-center space-x-3 transition-all duration-200 group/item"
             >
               <div className="relative">
                 <svg className="w-5 h-5 text-gray-500 group-hover/item:text-red-600 transition-colors duration-200 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                 </svg>
               </div>
               <span className="font-medium group-hover/item:text-red-900 transition-colors duration-200">Sign out</span>
             </button>
           </div>
        </div>
      )}

      {/* Profile Popup Modal */}
      {isProfilePopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
              <button
                onClick={() => setIsProfilePopupOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
              >
                ×
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6">
              {/* User Header */}
              <div className="relative flex items-center p-4 bg-gradient-to-r from-blue-800 via-teal-700 to-blue-800 rounded-lg mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt={user.name || 'User'} 
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        // Fallback to letter if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span className={`${profilePicture ? 'hidden' : 'flex'} text-2xl font-bold text-white`}>
                    {firstLetter}
                  </span>
                </div>
                <div className="ml-4 flex flex-col justify-center items-start">
                  <h3 className="text-xl font-bold text-white">
                    {user?.name || user?.email || 'User'}
                  </h3>
                  <p className="text-white/80 text-sm -mt-1">Member since {formatDate(new Date())}</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                {/* Full Name */}
                <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Full Name</span>
                  </div>
                  <span className="text-sm text-gray-900 font-semibold">{user?.name || 'Not provided'}</span>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Email</span>
                  </div>
                  <span className="text-sm text-gray-900 font-semibold">{user?.email || 'Not provided'}</span>
                </div>

                {/* Phone Number - Editable */}
                <div className="py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Phone Number</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-semibold text-gray-900">+91</span>
                      <input
                        type="tel"
                        value={phoneNumber.replace('+91', '')}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numbers and limit length
                          const numbersOnly = value.replace(/\D/g, '').substring(0, 10);
                          setPhoneNumber('+91' + numbersOnly);
                        }}
                        placeholder="Enter phone number"
                        className="text-sm text-gray-900 font-semibold bg-transparent border-none outline-none w-32"
                        maxLength={10}
                      />
                    </div>
                  </div>
                  
                  {/* Save Button and Message - Bottom Right */}
                  <div className="flex justify-end mt-3">
                    <div className="flex flex-col items-end space-y-1">
                      <button
                        onClick={handleSavePhoneNumber}
                        disabled={isSaving}
                        className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      {saveMessage && (
                        <div className={`text-xs font-medium ${
                          saveMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {saveMessage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Popup Modal */}
      {isPaymentPopupOpen && (
        <div className="fixed inset-0 z-50">
          <PaymentPopup isOpen={isPaymentPopupOpen} onClose={() => setIsPaymentPopupOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
