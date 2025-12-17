import React, { useState, useEffect } from 'react';
import { X, Lock, Hash, Check, AlertCircle } from 'lucide-react';

export default function AccountSettings({ username, onClose, onChangePassword }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usePin, setUsePin] = useState(false);
  const [noPassword, setNoPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserUsePin, setCurrentUserUsePin] = useState(false);
  const [currentUserNoPassword, setCurrentUserNoPassword] = useState(false);

  useEffect(() => {
    // Check if current user uses PIN
    const usersJson = localStorage.getItem('users');
    if (usersJson) {
      const users = JSON.parse(usersJson);
      if (users[username]) {
        setCurrentUserUsePin(users[username].usePin || false);
        setCurrentUserNoPassword(users[username].noPassword || false);
        setNoPassword(users[username].noPassword || false);
      }
    }
  }, [username]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validate new password/PIN
    if (!currentUserNoPassword && !currentPassword) {
      setError('Current password/PIN is required');
      setIsLoading(false);
      return;
    }

    if (!noPassword && (!newPassword || !confirmPassword)) {
      setError('New password/PIN fields are required');
      setIsLoading(false);
      return;
    }

    if (!noPassword && newPassword !== confirmPassword) {
      setError('New password/PIN and confirmation do not match');
      setIsLoading(false);
      return;
    }

    // Validate based on type (only if not using noPassword)
    if (!noPassword) {
      if (usePin) {
        if (!/^\d{4,6}$/.test(newPassword)) {
          setError('PIN must be 4-6 digits');
          setIsLoading(false);
          return;
        }
      } else {
        if (newPassword.length < 4) {
          setError('Password must be at least 4 characters');
          setIsLoading(false);
          return;
        }
      }
    }

    const result = onChangePassword(currentPassword, newPassword, usePin, noPassword);
    
    if (result.success) {
      setSuccess(noPassword ? 'Account changed to no password login!' : `${usePin ? 'PIN' : 'Password'} changed successfully!`);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsLoading(false);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition"
          disabled={isLoading}
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-full mb-3">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Account Settings</h2>
          <p className="text-sm text-gray-600 mt-1">
            Change your {currentUserUsePin ? 'PIN' : 'password'} for <strong>{username}</strong>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm font-semibold">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border-2 border-green-200 rounded-lg flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm font-semibold">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!currentUserNoPassword && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current {currentUserUsePin ? 'PIN' : 'Password'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {currentUserUsePin ? (
                  <Hash className="h-5 w-5 text-gray-400" />
                ) : (
                  <Lock className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <input
                type={currentUserUsePin ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  if (currentUserUsePin) {
                    if (value === '' || /^\d+$/.test(value)) {
                      setCurrentPassword(value);
                    }
                  } else {
                    setCurrentPassword(value);
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={`Enter current ${currentUserUsePin ? 'PIN' : 'password'}`}
                required
                disabled={isLoading}
                maxLength={currentUserUsePin ? 6 : undefined}
                inputMode={currentUserUsePin ? 'numeric' : 'text'}
              />
            </div>
          </div>
          )}

          <div className="border-t pt-4">
            <div className="mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noPassword}
                  onChange={(e) => {
                    setNoPassword(e.target.checked);
                    setUsePin(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    setError('');
                  }}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  disabled={isLoading}
                />
                <span className="text-sm font-medium text-gray-700">
                  Remove password/PIN (login without security)
                </span>
              </label>
            </div>

            {!noPassword && (
              <div className="mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usePin}
                    onChange={(e) => {
                      setUsePin(e.target.checked);
                      setNewPassword('');
                      setConfirmPassword('');
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

            {noPassword && (
              <div className="mb-3 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                <p className="text-xs text-red-800 font-semibold leading-relaxed">
                  🔓 <strong>SECURITY WARNING:</strong> Without a password or PIN, anyone with access to your device can view and modify your work records. This option is only recommended for devices that only you use.
                </p>
              </div>
            )}

            {!noPassword && (
              <div className="mb-3 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                <p className="text-xs text-yellow-800 font-semibold leading-relaxed">
                  ⚠️ <strong>WARNING:</strong> There is no way to reset your {usePin ? 'PIN' : 'password'}. Make sure to remember it!
                </p>
              </div>
            )}

            {!noPassword && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New {usePin ? 'PIN' : 'Password'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {usePin ? (
                      <Hash className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <input
                    type={usePin ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (usePin) {
                        if (value === '' || /^\d+$/.test(value)) {
                          setNewPassword(value);
                        }
                      } else {
                        setNewPassword(value);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={usePin ? 'Enter 4-6 digit PIN' : 'Enter new password'}
                    required
                    disabled={isLoading}
                    maxLength={usePin ? 6 : undefined}
                    inputMode={usePin ? 'numeric' : 'text'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New {usePin ? 'PIN' : 'Password'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {usePin ? (
                      <Hash className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <input
                    type={usePin ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (usePin) {
                        if (value === '' || /^\d+$/.test(value)) {
                          setConfirmPassword(value);
                        }
                      } else {
                        setConfirmPassword(value);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={usePin ? 'Confirm PIN' : 'Confirm password'}
                    required
                    disabled={isLoading}
                    maxLength={usePin ? 6 : undefined}
                    inputMode={usePin ? 'numeric' : 'text'}
                  />
                </div>
              </div>
            </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || success}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : noPassword ? 'Remove Password/PIN' : 'Change ' + (usePin ? 'PIN' : 'Password')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
