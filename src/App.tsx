import React, { useState, useEffect } from 'react';
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
    <div className="min-h-screen bg-gray-50 flex flex-col p-6 font-sans text-gray-800">
      <div className="max-w-4xl w-full mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Centralized API Dashboard</h1>
        <p className="text-gray-500 text-sm">Testing interface for Auth, Email, and Database services</p>
      </div>

      <div className="max-w-4xl w-full mx-auto mb-8 flex flex-wrap gap-2 justify-center">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          My Profile
        </button>
        <button 
          onClick={() => setActiveTab('docs')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === 'docs' ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          API Docs
        </button>
        <button 
          onClick={() => setActiveTab('auth')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === 'auth' ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          Auth Testing
        </button>
        <button 
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === 'email' ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          Email Testing
        </button>
        <button 
          onClick={() => setActiveTab('db')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === 'db' ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          Database Viewer
        </button>
        <button 
          onClick={() => setActiveTab('keys')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === 'keys' ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          API Keys
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'docs' && <DocsTab />}
        {activeTab === 'auth' && <AuthTab />}
        {activeTab === 'email' && <EmailTab />}
        {activeTab === 'db' && <DatabaseTab />}
        {activeTab === 'keys' && <ApiKeysTab />}
      </div>
    </div>
  );
}
