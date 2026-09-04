import React from 'react';

interface RelationalViewProps {
  data: any;
}

export function RelationalView({ data }: RelationalViewProps) {
  if (!data || !data.users) return null;
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 mb-4">This view aggregates all data conceptually by User.</p>
      {data.users.map((user: any) => {
        const userSessions = data.sessions?.filter((s: any) => s.user_id === user.id) || [];
        const userApiKeys = data.apiKeys?.filter((k: any) => k.user_id === user.id) || [];
        const userEmailMessages = data.emailMessages?.filter((m: any) => m.user_id === user.id) || [];
        const userAiLogs = data.aiLogs?.filter((l: any) => l.user_id === user.id) || [];
        
        return (
          <div key={user.id} className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                    {user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    {user.username ? user.username : user.email}
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-700'}`}>
                      {user.role}
                    </span>
                  </h4>
                  <div className="text-xs text-gray-500 font-mono mt-0.5">{user.id}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 font-medium">Last active</div>
                <div className="text-sm text-gray-800">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <h5 className="font-semibold text-sm mb-3 flex justify-between">
                  Active Sessions
                  <span className="text-gray-500 font-normal bg-gray-100 px-2 py-0.5 rounded-full text-xs">{userSessions.length}</span>
                </h5>
                {userSessions.length > 0 ? (
                  <ul className="text-sm space-y-2 max-h-48 overflow-y-auto pr-2">
                    {userSessions.map((s: any) => (
                      <li key={s.id} className="border-b border-gray-50 last:border-0 pb-2 flex justify-between text-gray-600">
                        <span className="truncate max-w-[150px] font-mono text-xs">{s.id}</span>
                        <span className="text-xs text-gray-400">Exp: {new Date(s.expires_at).toLocaleDateString()}</span>
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
                  <ul className="text-sm space-y-2 max-h-48 overflow-y-auto pr-2">
                    {userApiKeys.map((k: any) => (
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

              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <h5 className="font-semibold text-sm mb-3 flex justify-between">
                  Email History
                  <span className="text-gray-500 font-normal bg-gray-100 px-2 py-0.5 rounded-full text-xs">{userEmailMessages.length}</span>
                </h5>
                {userEmailMessages.length > 0 ? (
                  <ul className="text-sm space-y-2 max-h-48 overflow-y-auto pr-2">
                    {userEmailMessages.map((m: any) => (
                      <li key={m.id} className="border-b border-gray-50 last:border-0 pb-2 text-gray-600">
                        <div className="font-medium text-gray-800">{m.template}</div>
                        <div className="flex justify-between mt-0.5">
                          <span className="text-xs text-gray-500">{m.to_email}</span>
                          <span className={`text-xs ${m.status === 'sent' ? 'text-green-600' : m.status === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>
                            {m.status} {m.provider_message_id?.startsWith('http') && <a href={m.provider_message_id} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline ml-1">(Preview)</a>}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-gray-400 italic">No email messages</p>}
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <h5 className="font-semibold text-sm mb-3 flex justify-between">
                  AI Logs
                  <span className="text-gray-500 font-normal bg-gray-100 px-2 py-0.5 rounded-full text-xs">{userAiLogs.length}</span>
                </h5>
                {userAiLogs.length > 0 ? (
                  <ul className="text-sm space-y-2 max-h-48 overflow-y-auto pr-2">
                    {userAiLogs.map((log: any) => (
                      <li key={log.id} className="border-b border-gray-50 last:border-0 pb-2 text-gray-600">
                        <div className="font-medium text-gray-800 truncate">{log.model}</div>
                        <div className="flex justify-between mt-0.5">
                          <span className="text-xs text-gray-500 truncate max-w-[150px]">{log.prompt}</span>
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
      })}
    </div>
  );
}
