import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function AuthTab() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<{ email: string; id: string; auth_provider?: string } | null>(null);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username })
      });
      const data = await res.json();
      setMessage(data.message || data.error);
    } catch (e) {
      setMessage('Error registering');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (res.ok) {
        checkAuth();
      }
    } catch (e) {
      setMessage('Error logging in');
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (res.ok) {
        checkAuth();
      }
    } catch (e) {
      setMessage('Error logging in with Google');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setMessage('Logged out');
    } catch (e) {
      setMessage('Error logging out');
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <div className="max-w-2xl w-full mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Test Authentication</h2>
            
            {user ? (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Currently logged in as:</p>
                <p className="font-medium mb-4 truncate text-sm">{user.email}</p>
                <button 
                  onClick={handleLogout}
                  className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-gray-400 font-normal">(optional, for register)</span></label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="johndoe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={handleLogin}
                      type="button"
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
                    >
                      Login
                    </button>
                    <button 
                      onClick={handleRegister}
                      type="button"
                      className="flex-1 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition text-sm font-medium"
                    >
                      Register
                    </button>
                  </div>
                </form>

                <div className="relative flex items-center justify-center my-4">
                  <div className="absolute border-t border-gray-200 w-full"></div>
                  <span className="bg-white px-3 text-xs text-gray-400 relative">OR</span>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => setMessage('Google Login Failed')}
                  />
                </div>
              </div>
            )}

            {message && (
              <div className="mt-4 p-3 rounded bg-gray-100 text-sm text-gray-700">
                {message}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Available Endpoints</h2>
            <ul className="space-y-3 text-sm font-mono">
              <li className="flex items-start gap-2">
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">POST</span>
                <span className="text-gray-600 truncate">/api/auth/register</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">POST</span>
                <span className="text-gray-600">/api/auth/login</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">POST</span>
                <span className="text-gray-600 truncate">/api/auth/google</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">POST</span>
                <span className="text-gray-600">/api/auth/logout</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">POST</span>
                <span className="text-gray-600 truncate">/api/auth/forgot-password</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">GET</span>
                <span className="text-gray-600">/api/auth/me</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
