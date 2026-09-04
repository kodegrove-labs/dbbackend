import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthTab from './frontend/AuthTab';
import EmailTab from './frontend/EmailTab';
import DatabaseTab from './frontend/DatabaseTab';
import DocsTab from './frontend/DocsTab';
import ApiKeysTab from './frontend/ApiKeysTab';
import ProfileTab from './frontend/ProfileTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<'auth' | 'email' | 'db' | 'docs' | 'keys' | 'profile'>('profile');
  const [verificationStatus, setVerificationStatus] = useState<{ status: 'loading' | 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const checkVerification = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (window.location.pathname === '/verify-email' && token) {
        setVerificationStatus({ status: 'loading', message: 'Verifying your email...' });
        try {
          const res = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });
          
          const data = await res.json();
          if (res.ok) {
            setVerificationStatus({ status: 'success', message: 'Your email has been successfully verified! You can now log in.' });
          } else {
            setVerificationStatus({ status: 'error', message: data.error || 'Verification failed.' });
          }
        } catch (e) {
          setVerificationStatus({ status: 'error', message: 'Network error during verification.' });
        }
      }
    };
    checkVerification();
  }, []);

  if (verificationStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans text-gray-800">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center">
          {verificationStatus.status === 'loading' && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          )}
          {verificationStatus.status === 'success' && (
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
          )}
          {verificationStatus.status === 'error' && (
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">!</div>
          )}
          <h2 className="text-2xl font-bold mb-2">Email Verification</h2>
          <p className="text-gray-600 mb-6">{verificationStatus.message}</p>
          <button 
            onClick={() => {
              window.history.replaceState({}, '', '/');
              setVerificationStatus(null);
              setActiveTab('auth');
            }}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-8 font-sans text-gray-800">
        
        {/* Header Section */}
        {/*<header className="w-full mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            Centralized API Dashboard
          </h1>
          <p className="text-gray-500 text-base md:text-lg">
            Testing interface for Auth, Email, and Database services
          </p>
        </header>*/}

        {/* Navigation Pills */}
        <nav className="w-full flex flex-wrap gap-3 justify-center mb-2">
          {[
            { id: 'profile', label: 'My Profile' },
            { id: 'docs', label: 'API Docs' },
            { id: 'auth', label: 'Auth Testing' },
            { id: 'email', label: 'Email Testing' },
            { id: 'db', label: 'Database Viewer' },
            { id: 'keys', label: 'API Keys' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 
                ${activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2 ring-offset-gray-50' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 shadow-sm'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* The Frame */}
        <main className="w-full flex-1 flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden relative">
          <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 absolute top-0 left-0"></div>
          <div className="p-6 md:p-10 flex-1 overflow-y-auto mt-2">
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'docs' && <DocsTab />}
            {activeTab === 'auth' && <AuthTab />}
            {activeTab === 'email' && <EmailTab />}
            {activeTab === 'db' && <DatabaseTab />}
            {activeTab === 'keys' && <ApiKeysTab />}
          </div>
        </main>

      </div>
    </GoogleOAuthProvider>
  );
}
