import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './storage.js'
import App from './App.jsx'
import AuthPage from './AuthPage.jsx'
import { AuthProvider, useAuth } from './AuthContext.jsx'

function AppWithAuth() {
  const { currentUser, isLoading, login, signup } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage onLogin={login} onSignup={signup} />;
  }

  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  </StrictMode>,
)
