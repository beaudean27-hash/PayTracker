import React, { useState } from 'react';
import { LogIn, UserPlus, Lock, User, Hash } from 'lucide-react';

export default function AuthPage({ onLogin, onSignup }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usePin, setUsePin] = useState(false);
  const [rememberUsername, setRememberUsername] = useState(false);
  const [noPassword, setNoPassword] = useState(false);
  const [usernameHasNoPassword, setUsernameHasNoPassword] = useState(false);

  // Load remembered username on mount
  React.useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberUsername(true);
    }
  }, []);

  // Check if username has no password when username changes (on login screen)
  React.useEffect(() => {
    if (isLoginMode && username) {
      const usersJson = localStorage.getItem('users');
      if (usersJson) {
        const users = JSON.parse(usersJson);
        if (users[username]) {
          setUsernameHasNoPassword(users[username].noPassword || false);
        } else {
          setUsernameHasNoPassword(false);
        }
      }
    } else {
      setUsernameHasNoPassword(false);
    }
  }, [username, isLoginMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Handle remember username
    if (isLoginMode) {
      if (rememberUsername) {
        localStorage.setItem('rememberedUsername', username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }
    } else {
      // For signup, always save username if no password is used
      if (noPassword) {
        localStorage.setItem('rememberedUsername', username);
      }
    }

    const result = isLoginMode ? onLogin(username, password) : onSignup(username, password, usePin, noPassword);

    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setUsername('');
    setPassword('');
    setUsePin(false);
    setNoPassword(false);
    // Keep remembered username if switching to login
    if (isLoginMode) {
      const savedUsername = localStorage.getItem('rememberedUsername');
      if (savedUsername) {
        setUsername(savedUsername);
        setRememberUsername(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            {isLoginMode ? (
              <LogIn className="w-8 h-8 text-white" />
            ) : (
              <UserPlus className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {isLoginMode 
              ? 'Sign in to track your work and payments' 
              : 'Sign up to start tracking your work'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>
            {!isLoginMode && (
              <p className="mt-1.5 text-xs text-gray-500">
                💡 Recommended format: firstname.lastname (e.g., john.smith)
              </p>
            )}
          </div>

          {!isLoginMode && (
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noPassword}
                  onChange={(e) => {
                    setNoPassword(e.target.checked);
                    setUsePin(false);
                    setPassword('');
                    setError('');
                  }}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  disabled={isLoading}
                />
                <span className="text-sm font-medium text-gray-700">
                  Login without password or PIN (not recommended)
                </span>
              </label>
            </div>
          )}

          {!isLoginMode && !noPassword && (
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usePin}
                  onChange={(e) => {
                    setUsePin(e.target.checked);
                    setPassword('');
                    setError('');
                  }}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  disabled={isLoading}
                />
                <span className="text-sm font-medium text-gray-700">
                  Use PIN instead of password (4-6 digits)
                </span>
              </label>
            </div>
          )}

          {!isLoginMode && !noPassword && (
            <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
              <p className="text-xs text-yellow-800 font-semibold leading-relaxed">
                ⚠️ <strong>WARNING:</strong> There is no way to reset your {usePin ? 'PIN' : 'password'}. Make sure to remember it!
              </p>
            </div>
          )}

          {((isLoginMode && !usernameHasNoPassword) || (!isLoginMode && !noPassword)) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {usePin && !isLoginMode ? 'PIN' : 'Password'}
                {isLoginMode && <span className="text-xs text-gray-500 ml-2">(if applicable)</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {usePin && !isLoginMode ? (
                    <Hash className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  type={usePin && !isLoginMode ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (usePin && !isLoginMode) {
                      // Only allow digits for PIN
                      if (value === '' || /^\d+$/.test(value)) {
                        setPassword(value);
                      }
                    } else {
                      setPassword(value);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={isLoginMode ? 'Enter password/PIN (leave empty if none)' : usePin ? 'Enter 4-6 digit PIN' : 'Enter your password'}
                  required={!isLoginMode && !noPassword}
                  disabled={isLoading}
                  maxLength={usePin && !isLoginMode ? 6 : undefined}
                  inputMode={usePin && !isLoginMode ? 'numeric' : 'text'}
                />
              </div>
            </div>
          )}

          {isLoginMode && usernameHasNoPassword && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                ℹ️ This account has no password. Click Sign In to continue.
              </p>
            </div>
          )}

          {isLoginMode && (
            <div className="mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberUsername}
                  onChange={(e) => setRememberUsername(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700">
                  Remember username
                </span>
              </label>
            </div>
          )}

          {!isLoginMode && noPassword && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <p className="text-xs text-red-800 font-semibold leading-relaxed">
                🔓 <strong>SECURITY WARNING:</strong> Without a password or PIN, anyone with access to your device can view and modify your work records. This option is only recommended for devices that only you use.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoginMode ? (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            disabled={isLoading}
            className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm disabled:text-indigo-400"
          >
            {isLoginMode 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'}
          </button>
        </div>

        {!isLoginMode && !noPassword && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Note:</strong> Username must be at least 3 characters. {usePin ? 'PIN must be 4-6 digits.' : 'Password must be at least 4 characters.'} Your data is stored locally in your browser.
            </p>
          </div>
        )}

        <div className="mt-6 text-center text-gray-500 text-sm">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}
