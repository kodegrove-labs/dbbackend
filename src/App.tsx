import React, { useState } from 'react';
import AuthTab from './frontend/AuthTab';
import EmailTab from './frontend/EmailTab';
import DatabaseTab from './frontend/DatabaseTab';
import DocsTab from './frontend/DocsTab';
import ApiKeysTab from './frontend/ApiKeysTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<'auth' | 'email' | 'db' | 'docs' | 'keys'>('docs');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6 font-sans text-gray-800">
      <div className="max-w-4xl w-full mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Centralized API Dashboard</h1>
        <p className="text-gray-500 text-sm">Testing interface for Auth, Email, and Database services</p>
      </div>

      <div className="max-w-4xl w-full mx-auto mb-8 flex flex-wrap gap-2 justify-center">
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
        {activeTab === 'docs' && <DocsTab />}
        {activeTab === 'auth' && <AuthTab />}
        {activeTab === 'email' && <EmailTab />}
        {activeTab === 'db' && <DatabaseTab />}
        {activeTab === 'keys' && <ApiKeysTab />}
      </div>
    </div>
  );
}
