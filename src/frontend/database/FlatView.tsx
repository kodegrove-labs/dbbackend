import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { SortableHeader } from './SortableHeader';

interface FlatViewProps {
  data: any;
  sortConfig: { [table: string]: { key: string, direction: 'asc' | 'desc' } };
  handleSort: (table: string, key: string) => void;
  getSortedData: (list: any[], table: string) => any[];
  openModal: (type: 'add' | 'edit', table: string, initialData: any) => void;
  handleDelete: (table: string, id: string) => void;
}

export function FlatView({ data, sortConfig, handleSort, getSortedData, openModal, handleDelete }: FlatViewProps) {
  if (!data) return null;
      return (
        <div className="space-y-8">
          {/* USERS TABLE */}
          <div>
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Users Table 
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{data.users?.length || 0}</span>
              </h3>
              {data.isAdmin && (
                <button onClick={() => openModal('add', 'users', { email: '', username: '', password_hash: '', email_verified: false, role: 'user', auth_provider: 'email' })} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                  <Plus className="w-4 h-4" /> Add User
                </button>
              )}
            </div>
            <div className="overflow-auto max-h-[400px]">
              {data.users?.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm">
                    <tr className="group">
                      <SortableHeader table="users" sortKey="id" label="ID" className="rounded-tl-lg" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="users" sortKey="email" label="Email" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="users" sortKey="username" label="Name" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="users" sortKey="avatar_url" label="Avatar" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="users" sortKey="stripe_customer_id" label="Stripe ID" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="users" sortKey="metadata" label="Metadata" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="users" sortKey="password_hash" label="Password" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="users" sortKey="email_verified" label="Verified" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="users" sortKey="auth_provider" label="Provider" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="users" sortKey="provider_id" label="Provider ID" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="users" sortKey="role" label="Role" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="users" sortKey="last_sign_in_at" label="Last Sign In" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="users" sortKey="created_at" label="Created" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="users" sortKey="updated_at" label="Updated" sortConfig={sortConfig} handleSort={handleSort} />
                      {data.isAdmin && <th className="px-4 py-2 rounded-tr-lg">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getSortedData(data.users, 'users').map((u: any) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]">{u.id}</td>
                        <td className="px-4 py-2">{u.email}</td>
                        <td className="px-4 py-2">{u.username ? u.username : <span className="text-gray-400 italic">None</span>}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[60px]" title={u.avatar_url}>{u.avatar_url || '-'}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]">{u.stripe_customer_id || '-'}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]" title={u.metadata ? JSON.stringify(u.metadata) : ''}>{u.metadata ? JSON.stringify(u.metadata) : '-'}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[60px]" title={u.password_hash}>{u.password_hash ? '***' : '-'}</td>
                        <td className="px-4 py-2">{u.email_verified ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-2 capitalize">{u.auth_provider}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]">{u.provider_id || '-'}</td>
                        <td className="px-4 py-2 font-medium capitalize">{u.role}</td>
                        <td className="px-4 py-2 text-gray-500 truncate max-w-[120px]">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 'Never'}</td>
                        <td className="px-4 py-2 text-gray-500 truncate max-w-[120px]">{u.created_at ? new Date(u.created_at).toLocaleString() : '-'}</td>
                        <td className="px-4 py-2 text-gray-500 truncate max-w-[120px]">{u.updated_at ? new Date(u.updated_at).toLocaleString() : '-'}</td>
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
            <div className="overflow-auto max-h-[400px]">
              {data.sessions?.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm">
                    <tr className="group">
                      <SortableHeader table="sessions" sortKey="id" label="ID" className="rounded-tl-lg" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="sessions" sortKey="user_id" label="User ID" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="sessions" sortKey="expires_at" label="Expires At" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="sessions" sortKey="created_at" label="Created" sortConfig={sortConfig} handleSort={handleSort} />
                      {data.isAdmin && <th className="px-4 py-2 rounded-tr-lg">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getSortedData(data.sessions, 'sessions').map((s: any) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]">{s.id}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]">{s.user_id}</td>
                        <td className="px-4 py-2 text-gray-500 truncate max-w-[120px]">{new Date(s.expires_at).toLocaleString()}</td>
                        <td className="px-4 py-2 text-gray-500 truncate max-w-[120px]">{new Date(s.created_at).toLocaleString()}</td>
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
            <div className="overflow-auto max-h-[400px]">
              {data.apiKeys?.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm">
                    <tr className="group">
                      <SortableHeader table="apiKeys" sortKey="id" label="ID" className="rounded-tl-lg" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="apiKeys" sortKey="user_id" label="User ID" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="apiKeys" sortKey="name" label="Name" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="apiKeys" sortKey="key_hash" label="Key Hash" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="apiKeys" sortKey="key_prefix" label="Prefix" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="apiKeys" sortKey="last_used_at" label="Last Used" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="apiKeys" sortKey="created_at" label="Created" sortConfig={sortConfig} handleSort={handleSort} />
                      {data.isAdmin && <th className="px-4 py-2 rounded-tr-lg">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getSortedData(data.apiKeys, 'apiKeys').map((k: any) => (
                      <tr key={k.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]">{k.id}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]">{k.user_id}</td>
                        <td className="px-4 py-2">{k.name}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]" title={k.key_hash}>{k.key_hash || '-'}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[60px]">{k.key_prefix}</td>
                        <td className="px-4 py-2 text-gray-500 truncate max-w-[120px]">{k.last_used_at ? new Date(k.last_used_at).toLocaleString() : 'Never'}</td>
                        <td className="px-4 py-2 text-gray-500 truncate max-w-[120px]">{new Date(k.created_at).toLocaleString()}</td>
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

          {/* VERIFICATION TOKENS TABLE */}
          <div>
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Verification Tokens Table 
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{data.verificationTokens?.length || 0}</span>
              </h3>
              {data.isAdmin && (
                <button onClick={() => openModal('add', 'verificationTokens', { user_id: '', token_hash: '', type: 'email_verification', expires_at: new Date(Date.now() + 86400000).toISOString() })} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                  <Plus className="w-4 h-4" /> Add Token
                </button>
              )}
            </div>
            <div className="overflow-auto max-h-[400px]">
              {data.verificationTokens?.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm">
                    <tr className="group">
                      <SortableHeader table="verificationTokens" sortKey="id" label="ID" className="rounded-tl-lg" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="verificationTokens" sortKey="user_id" label="User ID" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="verificationTokens" sortKey="token_hash" label="Token Hash" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="verificationTokens" sortKey="type" label="Type" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="verificationTokens" sortKey="expires_at" label="Expires At" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="verificationTokens" sortKey="created_at" label="Created" sortConfig={sortConfig} handleSort={handleSort} />
                      {data.isAdmin && <th className="px-4 py-2 rounded-tr-lg">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getSortedData(data.verificationTokens, 'verificationTokens').map((t: any) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]">{t.id}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]">{t.user_id}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]" title={t.token_hash}>{t.token_hash || '-'}</td>
                        <td className="px-4 py-2 capitalize">{t.type?.replace('_', ' ')}</td>
                        <td className="px-4 py-2 text-gray-500 truncate max-w-[120px]">{new Date(t.expires_at).toLocaleString()}</td>
                        <td className="px-4 py-2 text-gray-500 truncate max-w-[120px]">{new Date(t.created_at).toLocaleString()}</td>
                        {data.isAdmin && (
                          <td className="px-4 py-2 flex items-center gap-2">
                            <button onClick={() => openModal('edit', 'verificationTokens', t)} className="text-gray-400 hover:text-blue-600" title="Edit"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete('verificationTokens', t.id)} className="text-gray-400 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500 italic">No verification tokens found.</p>
              )}
            </div>
          </div>

          {/* PASSWORD RESET TOKENS TABLE */}
          <div>
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Password Reset Tokens Table 
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{data.passwordResetTokens?.length || 0}</span>
              </h3>
              {data.isAdmin && (
                <button onClick={() => openModal('add', 'passwordResetTokens', { user_id: '', token_hash: '', expires_at: new Date(Date.now() + 3600000).toISOString() })} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                  <Plus className="w-4 h-4" /> Add Reset Token
                </button>
              )}
            </div>
            <div className="overflow-auto max-h-[400px]">
              {data.passwordResetTokens?.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm">
                    <tr className="group">
                      <SortableHeader table="passwordResetTokens" sortKey="id" label="ID" className="rounded-tl-lg" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="passwordResetTokens" sortKey="user_id" label="User ID" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="passwordResetTokens" sortKey="token_hash" label="Token Hash" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="passwordResetTokens" sortKey="expires_at" label="Expires At" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="passwordResetTokens" sortKey="used_at" label="Used At" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="passwordResetTokens" sortKey="created_at" label="Created" sortConfig={sortConfig} handleSort={handleSort} />
                      {data.isAdmin && <th className="px-4 py-2 rounded-tr-lg">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getSortedData(data.passwordResetTokens, 'passwordResetTokens').map((t: any) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]">{t.id}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]">{t.user_id}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]" title={t.token_hash}>{t.token_hash || '-'}</td>
                        <td className="px-4 py-2 text-gray-500 truncate max-w-[120px]">{new Date(t.expires_at).toLocaleString()}</td>
                        <td className="px-4 py-2 text-gray-500 truncate max-w-[120px]">{t.used_at ? new Date(t.used_at).toLocaleString() : 'Not Used'}</td>
                        <td className="px-4 py-2 text-gray-500 truncate max-w-[120px]">{new Date(t.created_at).toLocaleString()}</td>
                        {data.isAdmin && (
                          <td className="px-4 py-2 flex items-center gap-2">
                            <button onClick={() => openModal('edit', 'passwordResetTokens', t)} className="text-gray-400 hover:text-blue-600" title="Edit"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete('passwordResetTokens', t.id)} className="text-gray-400 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500 italic">No password reset tokens found.</p>
              )}
            </div>
          </div>

          {/* EMAIL MESSAGES TABLE */}
          <div>
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Email Messages Table 
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{data.emailMessages?.length || 0}</span>
              </h3>
              {data.isAdmin && (
                <button onClick={() => openModal('add', 'emailMessages', { user_id: '', to_email: '', template: 'custom', status: 'pending' })} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                  <Plus className="w-4 h-4" /> Add Email Log
                </button>
              )}
            </div>
            <div className="overflow-auto max-h-[400px]">
              {data.emailMessages?.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm">
                    <tr className="group">
                      <SortableHeader table="emailMessages" sortKey="id" label="ID" className="rounded-tl-lg" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="emailMessages" sortKey="user_id" label="User ID" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="emailMessages" sortKey="to_email" label="To" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="emailMessages" sortKey="template" label="Template" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="emailMessages" sortKey="status" label="Status" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="emailMessages" sortKey="provider_message_id" label="Provider ID" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="emailMessages" sortKey="created_at" label="Created" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="emailMessages" sortKey="sent_at" label="Sent At" sortConfig={sortConfig} handleSort={handleSort} />
                      {data.isAdmin && <th className="px-4 py-2 rounded-tr-lg">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getSortedData(data.emailMessages, 'emailMessages').map((m: any) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]">{m.id}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]">{m.user_id}</td>
                        <td className="px-4 py-2 truncate max-w-[150px]">{m.to_email}</td>
                        <td className="px-4 py-2 capitalize">{m.template}</td>
                        <td className="px-4 py-2">
                           <span className={`px-2 py-0.5 rounded text-xs ${m.status === 'sent' ? 'bg-green-100 text-green-700' : m.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[120px]">
                          {m.provider_message_id?.startsWith('http') ? (
                            <a href={m.provider_message_id} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Preview</a>
                          ) : (
                            m.provider_message_id || '-'
                          )}
                        </td>
                        <td className="px-4 py-2 text-gray-500 truncate max-w-[120px]">{new Date(m.created_at).toLocaleString()}</td>
                        <td className="px-4 py-2 text-gray-500 truncate max-w-[120px]">{m.sent_at ? new Date(m.sent_at).toLocaleString() : '-'}</td>
                        {data.isAdmin && (
                          <td className="px-4 py-2 flex items-center gap-2">
                            <button onClick={() => openModal('edit', 'emailMessages', m)} className="text-gray-400 hover:text-blue-600" title="Edit"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete('emailMessages', m.id)} className="text-gray-400 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500 italic">No email messages found.</p>
              )}
            </div>
          </div>

          {/* AI LOGS TABLE */}
          <div>
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                AI Logs Table 
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{data.aiLogs?.length || 0}</span>
              </h3>
              {data.isAdmin && (
                <button onClick={() => openModal('add', 'aiLogs', { user_id: '', model: 'gemini-3.8-flash', prompt: '', response: '' })} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                  <Plus className="w-4 h-4" /> Add AI Log
                </button>
              )}
            </div>
            <div className="overflow-auto max-h-[400px]">
              {data.aiLogs?.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm">
                    <tr className="group">
                      <SortableHeader table="aiLogs" sortKey="id" label="ID" className="rounded-tl-lg" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="aiLogs" sortKey="user_id" label="User ID" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="aiLogs" sortKey="api_key_id" label="API Key ID" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="aiLogs" sortKey="model" label="Model" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="aiLogs" sortKey="prompt" label="Prompt" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="aiLogs" sortKey="response" label="Response" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="aiLogs" sortKey="tokens_used" label="Tokens" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="aiLogs" sortKey="error" label="Error" sortConfig={sortConfig} handleSort={handleSort} />
                      <SortableHeader table="aiLogs" sortKey="created_at" label="Created" sortConfig={sortConfig} handleSort={handleSort} />
                      {data.isAdmin && <th className="px-4 py-2 rounded-tr-lg">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getSortedData(data.aiLogs, 'aiLogs').map((log: any) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]">{log.id}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]">{log.user_id || '-'}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[80px]">{log.api_key_id || '-'}</td>
                        <td className="px-4 py-2">{log.model}</td>
                        <td className="px-4 py-2 truncate max-w-[120px]" title={log.prompt}>{log.prompt}</td>
                        <td className="px-4 py-2 truncate max-w-[120px]" title={log.response}>{log.response || '-'}</td>
                        <td className="px-4 py-2">{log.tokens_used || '0'}</td>
                        <td className="px-4 py-2 text-red-500 truncate max-w-[120px]" title={log.error}>{log.error || '-'}</td>
                        <td className="px-4 py-2 text-gray-500 truncate max-w-[120px]">{new Date(log.created_at).toLocaleString()}</td>
                        {data.isAdmin && (
                          <td className="px-4 py-2 flex items-center gap-2">
                            <button onClick={() => openModal('edit', 'aiLogs', log)} className="text-gray-400 hover:text-blue-600" title="Edit"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete('aiLogs', log.id)} className="text-gray-400 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500 italic">No AI logs found.</p>
              )}
            </div>
          </div>
        </div>
      );


}
