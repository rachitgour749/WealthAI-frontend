import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const UserAvatar = ({ setCurrentPage }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Array of light background colors
  const lightColors = [
    'bg-blue-100',
    'bg-green-100', 
    'bg-yellow-100',
    'bg-pink-100',
    'bg-purple-100',
    'bg-indigo-100',
    'bg-red-100',
    'bg-orange-100',
    'bg-teal-100',
    'bg-cyan-100',
    'bg-lime-100',
    'bg-emerald-100',
    'bg-violet-100',
    'bg-fuchsia-100',
    'bg-rose-100'
  ];

  // Function to get random light color based on user name
  const getRandomColor = (name) => {
    if (!name) return lightColors[0];
    const index = name.charCodeAt(0) % lightColors.length;
    return lightColors[index];
  };

  // Function to get first letter of user name
  const getFirstLetter = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
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
    if (setCurrentPage) {
      setCurrentPage('profile');
    }
  };

  const handlePaymentClick = () => {
    setIsDropdownOpen(false);
    if (setCurrentPage) {
      setCurrentPage('payment');
    }
  };

  if (!user) {
    return null;
  }

  const avatarColor = getRandomColor(user.name);
  const firstLetter = getFirstLetter(user.name);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
      >
        <div className={`w-8 h-8 rounded-full border-2 flex justify-center items-center ${avatarColor} text-gray-700 font-semibold text-[16px]`}>
          {firstLetter}
        </div>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-[270px] bg-white rounded-lg shadow-lg border border-gray-200 pt-2 z-50 max-h-[340px] overflow-y-auto sm:right-0">
          {/* User Info Section - Centered */}
          <div className="px-2 py-1 border-b border-gray-100 text-center">
            <div className="flex flex-col items-center space-y-3">
              <div className={`w-16 h-16 rounded-full flex justify-center items-center ${avatarColor} text-gray-700 font-semibold text-2xl`}>
                {firstLetter}
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500 mt-1">Sync and personalise across your devices</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleProfileClick}
              className="w-full px-6 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-150"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>My Profile</span>
            </button>

            <button
              onClick={handlePaymentClick}
              className="w-full px-6 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-150"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Payment</span>
            </button>

            <div className="border-t border-gray-100 my-2"></div>

            <button
              onClick={handleLogout}
              className="w-full px-[26px] py-1 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-150"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
