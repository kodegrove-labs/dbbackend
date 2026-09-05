import React, { useState, useEffect } from 'react';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { AuthSkeleton } from './skeletons/AuthSkeleton';

export default function AuthTab() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<{ email: string; id: string; auth_provider?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiTestLoading, setApiTestLoading] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<any>(null);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/auth/me', { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setSubmitting(true);
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ accessToken: tokenResponse.access_token })
        });
        const data = await res.json();
        setMessage(data.message || data.error);
        if (res.ok) {
          if (data.accessToken) {
            localStorage.setItem('token', data.accessToken);
          }
          checkAuth();
        }
      } catch (e: any) {
        setMessage('Error logging in with Google: ' + e.message);
      } finally {
        setSubmitting(false);
      }
    },
    onError: () => {
      setMessage('Google Login popup was closed or cancelled.');
    }
  });

  const testGoogleAuthApi = async () => {
    setApiTestLoading(true);
    setApiTestResult(null);
    try {
      const origin = window.location.origin;
      const res = await fetch(`/api/auth/google/test?origin=${encodeURIComponent(origin)}`);
      const data = await res.json();
      setApiTestResult(data);
    } catch (err: any) {
      setApiTestResult({ success: false, error: err.message });
    } finally {
      setApiTestLoading(false);
    }
  };

  const openGoogleSessionWindow = async () => {
    try {
      const origin = window.location.origin;
      const res = await fetch(`/api/auth/google/url?origin=${encodeURIComponent(origin)}`);
      const data = await res.json();
      if (data.url) {
        const win = window.open(data.url, 'google_session_window', 'width=550,height=650,menubar=no,status=no');
        if (!win) {
          setMessage('Popup blocked by browser. Please allow popups to open the Google session window.');
        } else {
          setMessage('Google session window opened in popup!');
        }
      }
    } catch (err: any) {
      setMessage('Failed to open Google Session window: ' + err.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, username })
      });
      const data = await res.json();
      setMessage(data.message || data.error);
    } catch (e) {
      setMessage('Error registering');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (res.ok) {
        if (data.accessToken) {
          localStorage.setItem('token', data.accessToken);
        }
        checkAuth();
      }
    } catch (e) {
      setMessage('Error logging in');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (res.ok) {
        if (data.accessToken) {
          localStorage.setItem('token', data.accessToken);
        }
        checkAuth();
      }
    } catch (e) {
      setMessage('Error logging in with Google');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setSubmitting(true);
    try {
      localStorage.removeItem('token');
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
      setMessage('Logged out');
    } catch (e) {
      setMessage('Error logging out');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <AuthSkeleton />;
  }

  return (
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
                <span className="bg-white px-3 text-xs text-gray-400 relative">OR GOOGLE AUTH</span>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => triggerGoogleLogin()}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  Sign in with Google (OAuth Popup)
                </button>

                <div className="flex justify-center opacity-80 scale-95">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => setMessage('Google Login Failed')}
                  />
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className="mt-4 p-3 rounded bg-gray-100 text-sm text-gray-700">
              {message}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Google Auth & Session Window Tester */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>🔐</span> Google Session Window (API)
              </h3>
              <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded">
                OAuth 2.0
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Verify if the Google session authorization window opens through the API endpoints.
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={testGoogleAuthApi}
                disabled={apiTestLoading}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition disabled:opacity-50"
              >
                {apiTestLoading ? 'Testing API...' : '⚡ Test via API'}
              </button>
              <button
                type="button"
                onClick={openGoogleSessionWindow}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-semibold transition flex items-center gap-1"
              >
                <span>↗</span> Open Session Window
              </button>
            </div>

            {apiTestResult && (
              <div className={`p-3 rounded-lg text-xs ${apiTestResult.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-red-50 border border-red-200 text-red-900'}`}>
                <div className="font-bold flex items-center gap-1 mb-1">
                  {apiTestResult.success ? '🟢 Google Session Window Active' : '🔴 Test Failed'}
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  <div>HTTP Status: <span className="font-semibold">{apiTestResult.httpStatus || 200}</span></div>
                  <div className="truncate">Origin: <span className="font-semibold">{apiTestResult.origin}</span></div>
                  {apiTestResult.sessionWindowUrl && (
                    <div className="pt-1">
                      <a 
                        href={apiTestResult.sessionWindowUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-700 underline font-semibold flex items-center gap-1 hover:text-blue-900"
                      >
                        Launch Direct Google Window ↗
                      </a>
                    </div>
                  )}
                  {apiTestResult.message && <div className="text-slate-600 pt-1 font-sans">{apiTestResult.message}</div>}
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 border-b pb-2">Available Endpoints</h2>
            <ul className="space-y-2 text-xs font-mono">
              <li className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">GET</span>
                <span className="text-gray-700 font-semibold">/api/auth/google/url</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">GET</span>
                <span className="text-gray-700 font-semibold">/api/auth/google/test</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">POST</span>
                <span className="text-gray-700 font-semibold">/api/auth/google</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">POST</span>
                <span className="text-gray-700">/api/auth/register</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">POST</span>
                <span className="text-gray-700">/api/auth/login</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">POST</span>
                <span className="text-gray-700">/api/auth/logout</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">GET</span>
                <span className="text-gray-700">/api/auth/me</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
