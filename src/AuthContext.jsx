import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (username, password) => {
    // Get all users from storage
    const usersJson = localStorage.getItem('users');
    const users = usersJson ? JSON.parse(usersJson) : {};

    // Check if user exists
    if (users[username]) {
      // If user has no password set, allow login with empty password
      if (users[username].noPassword && !password) {
        const user = { username };
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true };
      }
      
      // Check if password/PIN matches
      if (users[username].password === password) {
        const user = { username };
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true };
      }
    }

    return { success: false, error: 'Invalid username or password/PIN' };
  };

  const signup = (username, password, usePin = false, noPassword = false) => {
    // Validate inputs
    if (!username) {
      return { success: false, error: 'Username is required' };
    }

    if (username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }

    // Validate PIN or password if not using noPassword option
    if (!noPassword) {
      if (!password) {
        return { success: false, error: 'Password/PIN is required' };
      }

      if (usePin) {
        if (!/^\d{4,6}$/.test(password)) {
          return { success: false, error: 'PIN must be 4-6 digits' };
        }
      } else {
        if (password.length < 4) {
          return { success: false, error: 'Password must be at least 4 characters' };
        }
      }
    }

    // Get all users from storage
    const usersJson = localStorage.getItem('users');
    const users = usersJson ? JSON.parse(usersJson) : {};

    // Check if username already exists
    if (users[username]) {
      return { success: false, error: 'Username already exists' };
    }

    // Create new user
    users[username] = {
      password: noPassword ? '' : password,
      usePin: noPassword ? false : usePin,
      noPassword,
      createdAt: new Date().toISOString()
    };

    // Save users
    localStorage.setItem('users', JSON.stringify(users));

    // Log in the new user
    const user = { username };
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const changePassword = (currentPassword, newPassword, usePin = false, noPassword = false) => {
    if (!currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    // Get all users from storage
    const usersJson = localStorage.getItem('users');
    const users = usersJson ? JSON.parse(usersJson) : {};

    // Verify current password (skip if current user has no password)
    if (!users[currentUser.username].noPassword) {
      if (!users[currentUser.username] || users[currentUser.username].password !== currentPassword) {
        return { success: false, error: 'Current password/PIN is incorrect' };
      }
    }

    // Update password
    users[currentUser.username].password = noPassword ? '' : newPassword;
    users[currentUser.username].usePin = noPassword ? false : usePin;
    users[currentUser.username].noPassword = noPassword;
    users[currentUser.username].updatedAt = new Date().toISOString();

    // Save updated users
    localStorage.setItem('users', JSON.stringify(users));

    // If changing to no password, save username for auto-login
    if (noPassword) {
      localStorage.setItem('rememberedUsername', currentUser.username);
    }

    return { success: true };
  };

  const value = {
    currentUser,
    isLoading,
    login,
    signup,
    logout,
    changePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
