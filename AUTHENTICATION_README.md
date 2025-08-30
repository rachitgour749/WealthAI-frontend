# Authentication Implementation

This document describes the OAuth authentication system implemented in the WealthAI1 application.

## Features

### 1. Google OAuth Integration
- Uses Google OAuth 2.0 for secure authentication
- Client ID: `971009763113-o9e1t4bn1ckmj7pogam984v3p2uah5ee.apps.googleusercontent.com`
- Users can sign in with their Google accounts

### 2. User Authentication Flow
- **Login Modal**: Clean, modern login interface with Google Sign-In button
- **Token Management**: JWT tokens are stored securely in localStorage
- **Session Persistence**: User sessions persist across browser refreshes
- **Automatic Logout**: Tokens are validated and expired sessions are cleared

### 3. User Avatar & Dropdown Menu
- **Profile Picture**: Displays user's Google profile picture
- **Dropdown Menu**: Similar to Google's account popup with:
  - User information (name, email)
  - My Profile link
  - Payment link
  - Logout option

### 4. Protected Pages
- **Profile Page**: Users can view and edit their profile information
- **Payment Page**: Subscription management and billing history
- **Authentication Required**: Certain features require user authentication

## Components

### Core Components
- `AuthContext.jsx` - Authentication state management
- `Login.jsx` - Google OAuth login modal
- `UserAvatar.jsx` - User profile picture with dropdown menu
- `ProtectedRoute.jsx` - Route protection for authenticated users

### Pages
- `ProfilePage.jsx` - User profile management
- `PaymentPage.jsx` - Subscription and billing management

## Usage

### For Users
1. Click "Sign In" button in the navigation
2. Choose Google account to sign in with
3. Access all features and see profile picture in navbar
4. Click profile picture to access dropdown menu
5. Navigate to Profile or Payment pages
6. Logout when done

### For Developers
1. Import `useAuth` hook to access authentication state
2. Use `ProtectedRoute` component to protect pages
3. Access user data via `useAuth().user`
4. Use `login()` and `logout()` functions for authentication

## Security Features

- JWT token validation
- Automatic token expiration handling
- Secure localStorage usage
- Protected route implementation
- Click-outside dropdown closing

## Dependencies

- `@react-oauth/google` - Google OAuth integration
- `jwt-decode` - JWT token decoding
- React Context API - State management

## Configuration

The Google OAuth client ID is configured in `App.jsx`:
```jsx
<GoogleOAuthProvider clientId="971009763113-o9e1t4bn1ckmj7pogam984v3p2uah5ee.apps.googleusercontent.com">
```

## Future Enhancements

- Add more OAuth providers (Facebook, GitHub, etc.)
- Implement role-based access control
- Add two-factor authentication
- Enhanced security features
- User preferences and settings
