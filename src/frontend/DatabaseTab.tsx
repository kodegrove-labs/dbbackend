import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, X, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

export default function DatabaseTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'flat' | 'relational'>('flat');
  const [sortConfig, setSortConfig] = useState<{ [table: string]: { key: string, direction: 'asc' | 'desc' } }>({});

  const handleSort = (table: string, key: string) => {
    setSortConfig(prev => {
      const current = prev[table];
      if (current && current.key === key) {
        return { ...prev, [table]: { key, direction: current.direction === 'asc' ? 'desc' : 'asc' } };
      }
      return { ...prev, [table]: { key, direction: 'asc' } };
    });
  };

  const getSortedData = (list: any[] = [], table: string) => {
    const config = sortConfig[table];
    if (!config) return list;
    return [...list].sort((a, b) => {
      let valA = a[config.key];
      let valB = b[config.key];
      if (valA == null) valA = '';
      if (valB == null) valB = '';
      if (valA < valB) return config.direction === 'asc' ? -1 : 1;
      if (valA > valB) return config.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const SortableHeader = ({ table, sortKey, label, className = '' }: { table: string, sortKey: string, label: string, className?: string }) => {
    const config = sortConfig[table];
    const isActive = config?.key === sortKey;
    return (
      <th 
        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 select-none ${className}`}
        onClick={() => handleSort(table, sortKey)}
      >
        <div className="flex items-center gap-1">
          {label}
          {isActive ? (
            config.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
          ) : (
            <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </th>
    );
  };


  // Modal State
  const [modal, setModal] = useState<{ type: 'add' | 'edit', table: string, data: any } | null>(null);
  const [jsonStr, setJsonStr] = useState('');
  const [modalError, setModalError] = useState('');

  const fetchDatabase = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/db-dump');
      if (res.status === 401) {
        setError('Please log in via the Auth Testing tab to view the database.');
        return;
      }
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json);
      } else {
        setError(json.error || 'Failed to fetch database data');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabase();
  }, []);

  const openModal = (type: 'add' | 'edit', table: string, initialData: any) => {
    setModal({ type, table, data: initialData });
    setJsonStr(JSON.stringify(initialData, null, 2));
    setModalError('');
  };

  const handleSave = async () => {
    try {
      setModalError('');
      const payload = JSON.parse(jsonStr);
      const url = modal?.type === 'add' 
        ? `/api/admin/records/${modal.table}` 
        : `/api/admin/records/${modal.table}/${payload.id}`;
      const method = modal?.type === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setModal(null);
        fetchDatabase();
      } else {
        setModalError(json.error || 'Failed to save record');
      }
    } catch (err: any) {
      setModalError('Invalid JSON format: ' + err.message);
    }
  };

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await fetch(`/api/admin/records/${table}/${id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchDatabase();
      } else {
        alert(json.error || 'Failed to delete record');
      }
    } catch (err: any) {
      alert('Network error: ' + err.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full max-w-4xl relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Database Viewer</h2>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('flat')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${viewMode === 'flat' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Flat
            </button>
            <button
              onClick={() => setViewMode('relational')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${viewMode === 'relational' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Relational
            </button>
          </div>
          <button 
            onClick={fetchDatabase}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-sm">
          <strong>Connection Error:</strong> {error}
        </div>
      )}

      {!data && !error && !loading && (
        <div className="text-center text-gray-500 py-10">No data loaded.</div>
      )}

      {data && viewMode === 'flat' && (
        <div className="space-y-8">
          {/* USERS TABLE */}
          <div>
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Users Table 
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{data.users?.length || 0}</span>
              </h3>
              {data.isAdmin && (
                <button onClick={() => openModal('add', 'users', { email: '', password_hash: '', email_verified: false, role: 'user', auth_provider: 'email' })} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                  <Plus className="w-4 h-4" /> Add User
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              {data.users?.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr className="group">
                      <SortableHeader table="users" sortKey="id" label="ID" className="rounded-tl-lg" />
                      <SortableHeader table="users" sortKey="email" label="Email" />
                      <SortableHeader table="users" sortKey="role" label="Role" />
                      <SortableHeader table="users" sortKey="email_verified" label="Verified" />
                      <SortableHeader table="users" sortKey="created_at" label="Created" />
                      {data.isAdmin && <th className="px-4 py-2 rounded-tr-lg">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getSortedData(data.users, 'users').map((u: any) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[120px]">{u.id}</td>
                        <td className="px-4 py-2">{u.email}</td>
                        <td className="px-4 py-2 font-medium capitalize">{u.role}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${u.email_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {u.email_verified ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-500">{new Date(u.created_at).toLocaleString()}</td>
                        {data.isAdmin && (
                          <td className="px-4 py-2 flex items-center gap-2">
                            <button onClick={() => openModal('edit', 'users', u)} className="text-gray-400 hover:text-blue-600" title="Edit"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete('users', u.id)} className="text-gray-400 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500 italic">No users found.</p>
              )}
            </div>
          </div>

          {/* SESSIONS TABLE */}
          <div>
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Sessions Table 
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{data.sessions?.length || 0}</span>
              </h3>
              {data.isAdmin && (
                <button onClick={() => openModal('add', 'sessions', { user_id: '', expires_at: new Date(Date.now() + 86400000).toISOString() })} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                  <Plus className="w-4 h-4" /> Add Session
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              {data.sessions?.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr className="group">
                      <SortableHeader table="sessions" sortKey="user_id" label="User ID" className="rounded-tl-lg" />
                      <SortableHeader table="sessions" sortKey="expires_at" label="Expires At" />
                      <SortableHeader table="sessions" sortKey="created_at" label="Created" />
                      {data.isAdmin && <th className="px-4 py-2 rounded-tr-lg">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getSortedData(data.sessions, 'sessions').map((s: any) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono text-xs text-gray-500">{s.user_id}</td>
                        <td className="px-4 py-2 text-gray-500">{new Date(s.expires_at).toLocaleString()}</td>
                        <td className="px-4 py-2 text-gray-500">{new Date(s.created_at).toLocaleString()}</td>
                        {data.isAdmin && (
                          <td className="px-4 py-2 flex items-center gap-2">
                            <button onClick={() => openModal('edit', 'sessions', s)} className="text-gray-400 hover:text-blue-600" title="Edit"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete('sessions', s.id)} className="text-gray-400 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500 italic">No sessions found.</p>
              )}
            </div>
          </div>

          {/* API KEYS TABLE */}
          <div>
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                API Keys Table 
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{data.apiKeys?.length || 0}</span>
              </h3>
              {data.isAdmin && (
                <button onClick={() => openModal('add', 'apiKeys', { user_id: '', name: 'New Key', key_hash: '', key_prefix: 'sk_live_' })} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                  <Plus className="w-4 h-4" /> Add API Key
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              {data.apiKeys?.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr className="group">
                      <SortableHeader table="apiKeys" sortKey="id" label="ID" className="rounded-tl-lg" />
                      <SortableHeader table="apiKeys" sortKey="user_id" label="User ID" />
                      <SortableHeader table="apiKeys" sortKey="name" label="Name" />
                      <SortableHeader table="apiKeys" sortKey="key_prefix" label="Prefix" />
                      <SortableHeader table="apiKeys" sortKey="created_at" label="Created" />
                      {data.isAdmin && <th className="px-4 py-2 rounded-tr-lg">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getSortedData(data.apiKeys, 'apiKeys').map((k: any) => (
                      <tr key={k.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]">{k.id}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]">{k.user_id}</td>
                        <td className="px-4 py-2">{k.name}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500">{k.key_prefix}</td>
                        <td className="px-4 py-2 text-gray-500">{new Date(k.created_at).toLocaleString()}</td>
                        {data.isAdmin && (
                          <td className="px-4 py-2 flex items-center gap-2">
                            <button onClick={() => openModal('edit', 'apiKeys', k)} className="text-gray-400 hover:text-blue-600" title="Edit"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete('apiKeys', k.id)} className="text-gray-400 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500 italic">No API keys found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {data && viewMode === 'relational' && (
        <div className="space-y-6">
          {getSortedData(data.users, 'users')?.map((user: any) => {
            const userSessions = data.sessions?.filter((s: any) => s.user_id === user.id) || [];
            const userApiKeys = data.apiKeys?.filter((k: any) => k.user_id === user.id) || [];
            return (
              <div key={user.id} className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                      {user.email} 
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-700'}`}>
                        {user.role}
                      </span>
                    </h4>
                    <div className="text-xs text-gray-500 font-mono mt-1">ID: {user.id}</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Created: {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <h5 className="font-semibold text-sm mb-3 flex justify-between">
                      Sessions
                      <span className="text-gray-500 font-normal bg-gray-100 px-2 py-0.5 rounded-full text-xs">{userSessions.length}</span>
                    </h5>
                    {userSessions.length > 0 ? (
                      <ul className="text-sm space-y-2">
                        {userSessions.map((s: any) => (
                          <li key={s.id} className="border-b border-gray-50 last:border-0 pb-2 text-gray-600">
                            <span className="block text-xs font-mono text-gray-400 mb-0.5">ID: {s.id}</span>
                            Expires: {new Date(s.expires_at).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-sm text-gray-400 italic">No active sessions</p>}
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <h5 className="font-semibold text-sm mb-3 flex justify-between">
                      API Keys
                      <span className="text-gray-500 font-normal bg-gray-100 px-2 py-0.5 rounded-full text-xs">{userApiKeys.length}</span>
                    </h5>
                    {userApiKeys.length > 0 ? (
                      <ul className="text-sm space-y-2">
                        {userApiKeys.map((k: any) => (
                          <li key={k.id} className="border-b border-gray-50 last:border-0 pb-2 text-gray-600">
                            <div className="font-medium text-gray-800">{k.name}</div>
                            <div className="font-mono text-xs text-gray-500 mt-0.5">{k.key_prefix}********</div>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-sm text-gray-400 italic">No API keys</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg capitalize">{modal.type} Record ({modal.table})</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              <p className="text-sm text-gray-600 mb-2">Edit the JSON payload below directly to apply changes.</p>
              <textarea 
                className="w-full h-80 p-3 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                value={jsonStr}
                onChange={e => setJsonStr(e.target.value)}
                spellCheck={false}
              />
              {modalError && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
                  {modalError}
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button 
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
