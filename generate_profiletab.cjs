const fs = require('fs');

const finalCode = `import React, { useState, useEffect } from 'react';
import { User, Shield, Calendar, Fingerprint, Mail, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const localFetchAPI = async (url: string, options?: RequestInit) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = \`Bearer \${token}\`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });
  return response;
};

export default function ProfileTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await localFetchAPI('/api/auth/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError('Failed to load dashboard. Are you logged in?');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading profile dashboard...</div>;
  }

  if (!data || !data.user) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center border border-red-100 max-w-lg mx-auto">
        <h3 className="font-bold mb-2">Not Authenticated</h3>
        <p>Please log in via the Auth Testing tab to view your dashboard.</p>
      </div>
    );
  }

  const profile = data.user;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {error && <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">{error}</div>}
      
      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover bg-gray-100 border-4 border-white shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + (profile.username || profile.email) + '&background=random';
              }}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-4xl shadow-sm border-4 border-white">
              {(profile.username?.[0] || profile.email?.[0] || '?').toUpperCase()}
            </div>
          )}
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900">{profile.username || 'Anonymous User'}</h2>
            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 mt-1">
              <Mail className="w-4 h-4" />
              <span>{profile.email}</span>
            </div>
            <div className="mt-3 flex items-center justify-center md:justify-start gap-2">
              <span className={\`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider \${profile.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}\`}>
                {profile.role}
              </span>
              <span className={\`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 \${profile.email_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}\`}>
                {profile.email_verified ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {profile.email_verified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={loadDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition border border-gray-200 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <Fingerprint className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium text-sm">Account ID</h3>
          </div>
          <p className="text-gray-900 font-mono text-xs truncate" title={profile.id}>{profile.id}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <Shield className="w-5 h-5 text-purple-500" />
            <h3 className="font-medium text-sm">Role Level</h3>
          </div>
          <p className="text-gray-900 font-medium capitalize">{profile.role}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <Calendar className="w-5 h-5 text-green-500" />
            <h3 className="font-medium text-sm">Member Since</h3>
          </div>
          <p className="text-gray-900 font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <User className="w-5 h-5 text-orange-500" />
            <h3 className="font-medium text-sm">Auth Provider</h3>
          </div>
          <p className="text-gray-900 font-medium capitalize">{profile.auth_provider || 'Email'}</p>
        </div>
      </div>
      
      {/* Activity Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Account Activity</h3>
        <div className="divide-y divide-gray-100">
          <div className="py-3 flex justify-between items-center">
            <span className="text-gray-600 font-medium">Last Sign In</span>
            <span className="text-gray-900">{profile.last_sign_in_at ? new Date(profile.last_sign_in_at).toLocaleString() : 'Never'}</span>
          </div>
          <div className="py-3 flex justify-between items-center">
            <span className="text-gray-600 font-medium">Last Profile Update</span>
            <span className="text-gray-900">{profile.updated_at ? new Date(profile.updated_at).toLocaleString() : 'Never'}</span>
          </div>
        </div>
      </div>

      {/* Relational Data */}
      <h3 className="font-bold text-xl text-gray-800 pt-4">Your Data</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h5 className="font-semibold text-sm mb-3 flex justify-between items-center text-gray-700">
            Active Sessions
            <span className="text-gray-500 font-normal bg-gray-100 px-2 py-0.5 rounded-full text-xs">{(data.sessions || []).length}</span>
          </h5>
          {(data.sessions || []).length > 0 ? (
            <ul className="text-sm space-y-2">
              {data.sessions.map((s: any) => (
                <li key={s.id} className="border-b border-gray-50 last:border-0 pb-2 flex justify-between text-gray-600">
                  <span className="truncate max-w-[150px] font-mono text-xs">{s.id}</span>
                  <span className="text-xs text-gray-400">Exp: {new Date(s.expires_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-400 italic">No active sessions</p>}
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h5 className="font-semibold text-sm mb-3 flex justify-between items-center text-gray-700">
            API Keys
            <span className="text-gray-500 font-normal bg-gray-100 px-2 py-0.5 rounded-full text-xs">{(data.apiKeys || []).length}</span>
          </h5>
          {(data.apiKeys || []).length > 0 ? (
            <ul className="text-sm space-y-2">
              {data.apiKeys.map((k: any) => (
                <li key={k.id} className="border-b border-gray-50 last:border-0 pb-2 text-gray-600">
                  <div className="font-medium text-gray-800">{k.name}</div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-xs font-mono text-gray-500">{k.key_prefix}...</span>
                    <span className="text-xs text-green-600 font-mono">Active</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-400 italic">No API keys</p>}
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h5 className="font-semibold text-sm mb-3 flex justify-between items-center text-gray-700">
            Email History
            <span className="text-gray-500 font-normal bg-gray-100 px-2 py-0.5 rounded-full text-xs">{(data.emailMessages || []).length}</span>
          </h5>
          {(data.emailMessages || []).length > 0 ? (
            <ul className="text-sm space-y-2 max-h-64 overflow-y-auto pr-2">
              {data.emailMessages.map((m: any) => (
                <li key={m.id} className="border-b border-gray-50 last:border-0 pb-2 text-gray-600">
                  <div className="font-medium text-gray-800">{m.template}</div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-xs text-gray-500 truncate max-w-[150px]">{m.to_email}</span>
                    <span className={\`text-xs \${m.status === 'sent' ? 'text-green-600' : m.status === 'failed' ? 'text-red-600' : 'text-yellow-600'}\`}>
                      {m.status} {m.provider_message_id?.startsWith('http') && <a href={m.provider_message_id} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline ml-1">(Preview)</a>}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-400 italic">No email messages</p>}
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h5 className="font-semibold text-sm mb-3 flex justify-between items-center text-gray-700">
            AI Logs
            <span className="text-gray-500 font-normal bg-gray-100 px-2 py-0.5 rounded-full text-xs">{(data.aiLogs || []).length}</span>
          </h5>
          {(data.aiLogs || []).length > 0 ? (
            <ul className="text-sm space-y-2 max-h-64 overflow-y-auto pr-2">
              {data.aiLogs.map((log: any) => (
                <li key={log.id} className="border-b border-gray-50 last:border-0 pb-2 text-gray-600">
                  <div className="font-medium text-gray-800 truncate" title={log.model}>{log.model}</div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-xs text-gray-500 truncate max-w-[150px]" title={log.prompt}>{log.prompt}</span>
                    <span className="text-xs text-blue-600">{log.tokens_used || 0} tokens</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-400 italic">No AI logs</p>}
        </div>
      </div>
    </div>
  );
}
\`;

fs.writeFileSync('src/frontend/ProfileTab.tsx', finalCode);
