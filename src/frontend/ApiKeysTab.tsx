import React, { useState, useEffect } from 'react';
import { Key, Plus, Copy, Check, Clock } from 'lucide-react';

export default function ApiKeysTab() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<{ apiKey: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  const fetchKeys = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/keys');
      if (res.status === 401) {
        setErrorMsg('Please log in via the Auth Testing tab to manage your API keys.');
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to fetch');
      }
      const data = await res.json();
      if (data.keys) {
        setKeys(data.keys);
      }
    } catch (err) {
      console.error('Failed to fetch keys', err);
      setErrorMsg('Failed to load API keys.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    try {
      const res = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName })
      });
      const data = await res.json();
      if (data.apiKey) {
        setGeneratedKey(data);
        setNewKeyName('');
        fetchKeys();
      }
    } catch (err) {
      console.error('Failed to generate key', err);
    }
  };

  const copyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 w-full max-w-4xl text-left">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
          <Key className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">API Keys</h2>
          <p className="text-sm text-gray-500">Generate dynamic API keys for other services to connect securely.</p>
        </div>
      </div>

      {errorMsg ? (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
          {errorMsg}
        </div>
      ) : (
        <>
          {generatedKey && (
            <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
              <h3 className="text-lg font-bold text-green-900 mb-2">New API Key Generated!</h3>
              <p className="text-sm text-green-700 mb-4">
                Please copy this key now. For security reasons, you will <strong>never</strong> be able to see it again.
              </p>
              <div className="flex items-center gap-2 bg-white border border-green-300 rounded-lg p-1 pl-4">
                <code className="text-sm text-gray-800 flex-1 break-all">{generatedKey.apiKey}</code>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleGenerate} className="flex items-end gap-4 mb-8 pb-8 border-b border-gray-100">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Name (e.g., 'Payment Microservice')</label>
              <input 
                type="text" 
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="What is this key for?"
                required
              />
            </div>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Generate New Key
            </button>
          </form>

          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Active Keys</h3>
            {loading && keys.length === 0 ? (
              <p className="text-gray-500 text-sm">Loading keys...</p>
            ) : keys.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No dynamic API keys generated yet.</p>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Key Prefix</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Last Used</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {keys.map((k) => (
                      <tr key={k.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-900">{k.name}</td>
                        <td className="px-4 py-3">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">
                            {k.key_prefix}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(k.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {k.last_used_at ? (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(k.last_used_at).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-gray-400">Never</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
