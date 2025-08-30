import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const UserAvatar = ({ setCurrentPage }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const colorScheme = getColorScheme(user.name);
  const firstLetter = getFirstLetter(user.name);

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
           <div className={`relative w-8 h-8 rounded-full bg-gradient-to-br ${colorScheme.light} flex justify-center items-center text-white font-semibold text-[16px] shadow-lg ${colorScheme.shadow} border border-white/20 backdrop-blur-sm transform transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 group-hover:shadow-xl group-hover:shadow-black/20`}>
             {/* Soft inner highlight for gentle 3D effect */}
             <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/25 via-white/10 to-transparent"></div>
             
             {/* Text with subtle drop shadow */}
             <span className="relative z-10 drop-shadow-sm font-medium">{firstLetter}</span>
             
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
                 <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${colorScheme.light} flex justify-center items-center text-white font-bold text-3xl shadow-2xl ${colorScheme.shadow} border-4 border-white/30 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30`}>
                   {/* Inner highlight */}
                   <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-white/10 to-transparent"></div>
                   
                   {/* Text with enhanced drop shadow */}
                   <span className="relative z-10 drop-shadow-lg">{firstLetter}</span>
                   
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
    </div>
  );
};

export default UserAvatar;
