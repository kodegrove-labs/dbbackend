import React, { useState, useEffect } from 'react';
import { EmailPreviewSkeleton, EmailSendingSkeleton } from './skeletons/EmailPreviewSkeleton';

interface SmtpStatus {
  isConfigured: boolean;
  host: string;
  port: number;
  from: string;
  user: string;
  isEthereal: boolean;
  serviceKeyConfigured: boolean;
}

interface CurrentUser {
  id: string;
  email: string;
  role: string;
}

export default function EmailTab() {
  const [mode, setMode] = useState<'custom' | 'template'>('template');
  const [to, setTo] = useState('guptaharshit279@gmail.com');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [actionType, setActionType] = useState<'preview' | 'send' | null>(null);
  const [responseMsg, setResponseMsg] = useState('');
  const [deliveryDetails, setDeliveryDetails] = useState<{
    previewUrl?: string;
    isEthereal?: boolean;
    sender?: string;
    senderUserId?: string;
  } | null>(null);

  // Auth & SMTP State
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [smtpStatus, setSmtpStatus] = useState<SmtpStatus | null>(null);
  
  // Preview State
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewSubject, setPreviewSubject] = useState('');

  // Custom Form State
  const [subject, setSubject] = useState('Test Custom Email');
  const [message, setMessage] = useState('This is a test email sent from the custom API route.');

  // Template Form State
  const [template, setTemplate] = useState('welcome');
  const [name, setName] = useState('Harshit');
  const [appName, setAppName] = useState('My Awesome App');
  const [link, setLink] = useState('https://example.com/verify');
  
  // Specific Template States
  const [amount, setAmount] = useState('$49.00');
  const [invoiceId, setInvoiceId] = useState('INV-2023-001');
  const [deviceName, setDeviceName] = useState('MacBook Pro (Safari)');
  const [location, setLocation] = useState('San Francisco, CA, USA');
  const [inviterName, setInviterName] = useState('Alex Doe');
  const [teamName, setTeamName] = useState('Engineering Team');

  // API Key State (Optional if logged in)
  const [apiKey, setApiKey] = useState('my-secret-service-key');

  // Load current user and SMTP configuration on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    fetch('/api/email/status')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setSmtpStatus(data);
      })
      .catch(() => {});
  }, []);

  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (apiKey.trim()) {
      headers['x-api-key'] = apiKey.trim();
    }
    return headers;
  };

  const handlePreview = async () => {
    setStatus('loading');
    setActionType('preview');
    setResponseMsg('');
    setPreviewHtml('');
    setPreviewSubject('');
    setDeliveryDetails(null);
    
    try {
      const payload = {
        template,
        data: {
          name,
          appName,
          verifyLink: template === 'verifyEmail' ? link : undefined,
          resetLink: template === 'passwordReset' ? link : undefined,
          dashboardLink: template === 'welcome' ? link : undefined,
          receiptLink: template === 'invoice' ? link : undefined,
          reviewLink: template === 'securityAlert' ? link : undefined,
          inviteLink: template === 'invitation' ? link : undefined,
          amount,
          invoiceId,
          date: new Date().toLocaleDateString(),
          deviceName,
          location,
          time: new Date().toLocaleString(),
          inviterName,
          teamName
        }
      };

      const res = await fetch('/api/email/preview', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStatus('idle');
        setActionType(null);
        setPreviewSubject(data.subject);
        setPreviewHtml(data.html);
      } else {
        setStatus('error');
        setActionType(null);
        setResponseMsg(data.error || 'Failed to generate preview');
      }
    } catch (err: any) {
      setStatus('error');
      setActionType(null);
      setResponseMsg('Network error: ' + err.message);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setActionType('send');
    setResponseMsg('');
    setDeliveryDetails(null);
    
    try {
      let endpoint = '';
      let payload = {};

      if (mode === 'custom') {
        endpoint = '/api/email/test';
        payload = { to, subject, message };
      } else {
        endpoint = '/api/email/template';
        payload = {
          to,
          template,
          data: {
            name,
            appName,
            verifyLink: template === 'verifyEmail' ? link : undefined,
            resetLink: template === 'passwordReset' ? link : undefined,
            dashboardLink: template === 'welcome' ? link : undefined,
            receiptLink: template === 'invoice' ? link : undefined,
            reviewLink: template === 'securityAlert' ? link : undefined,
            inviteLink: template === 'invitation' ? link : undefined,
            amount,
            invoiceId,
            date: new Date().toLocaleDateString(),
            deviceName,
            location,
            time: new Date().toLocaleString(),
            inviterName,
            teamName
          }
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStatus('success');
        setActionType(null);
        setResponseMsg(data.message || 'Email sent successfully!');
        setDeliveryDetails({
          previewUrl: data.previewUrl,
          isEthereal: data.isEthereal,
          sender: data.sender,
          senderUserId: data.senderUserId
        });
      } else {
        setStatus('error');
        setActionType(null);
        setResponseMsg(data.error || 'Failed to send email');
      }
    } catch (err: any) {
      setStatus('error');
      setActionType(null);
      setResponseMsg('Network error: ' + err.message);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-8 w-full mx-auto ${mode === 'template' ? 'max-w-5xl' : 'max-w-xl'}`}>
      {/* Configuration & Identity Banners */}
      <div className="mb-6 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Auth Identity:</span>
            {currentUser ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                👤 {currentUser.email} ({currentUser.role})
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                ⚠️ Guest / API Key mode
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">SMTP Transport:</span>
            {smtpStatus?.isConfigured && !smtpStatus?.isEthereal ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium" title={smtpStatus.from}>
                🟢 Live SMTP ({smtpStatus.host})
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 font-medium">
                🟡 Ethereal Sandbox (Test Inbox)
              </span>
            )}
          </div>
        </div>

        {smtpStatus?.isConfigured && !smtpStatus?.isEthereal && (
          <div className="px-3 py-1.5 bg-blue-50/60 border border-blue-100 rounded text-xs text-blue-800">
            ✉️ Outgoing sender envelope: <span className="font-mono font-medium">{smtpStatus.from}</span>
          </div>
        )}
      </div>

      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-gray-800">Test Email API</h2>
        <p className="text-xs text-gray-500 mt-1">
          Send emails and verify delivery. Attributed to your user account in the Database Tab.
        </p>
        <div className="flex justify-center mt-4 bg-gray-100 p-1 rounded-lg max-w-sm mx-auto">
          <button 
            type="button"
            onClick={() => { setMode('template'); setPreviewHtml(''); setDeliveryDetails(null); }}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${mode === 'template' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Pre-built Templates
          </button>
          <button 
            type="button"
            onClick={() => { setMode('custom'); setPreviewHtml(''); setDeliveryDetails(null); }}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${mode === 'custom' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Custom Message
          </button>
        </div>
      </div>

      <div className={`grid ${mode === 'template' ? 'md:grid-cols-2 gap-8' : 'grid-cols-1'}`}>
        <div>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-blue-900">
                  Service API Key {currentUser && <span className="text-xs font-normal text-blue-600">(Optional when logged in)</span>}
                </label>
              </div>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-blue-900 text-sm"
                placeholder={currentUser ? "Using logged-in user session (or enter API key)" : "Enter API Key to authorize"}
              />
              <p className="text-xs text-blue-600 mt-1">
                {currentUser 
                  ? `Authenticated as ${currentUser.email}. Requests will be attributed to your user.` 
                  : "Required for unauthenticated clients or external scripts."}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input 
                type="email" 
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="recipient@example.com"
              />
            </div>

            {mode === 'custom' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input 
                    type="text" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Template</label>
                  <select
                    value={template}
                    onChange={(e) => { setTemplate(e.target.value); setPreviewHtml(''); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="welcome">Welcome Email</option>
                    <option value="verifyEmail">Email Verification</option>
                    <option value="passwordReset">Password Reset</option>
                    <option value="invoice">Payment Invoice</option>
                    <option value="securityAlert">Security Alert</option>
                    <option value="invitation">Team Invitation</option>
                  </select>
                </div>
                
                {/* Common Fields */}
                <div className="grid grid-cols-2 gap-4">
                  {template !== 'invitation' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">App Name</label>
                    <input 
                      type="text" 
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Specific Fields: Invoice */}
                {template === 'invoice' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                      <input 
                        type="text" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Invoice ID</label>
                      <input 
                        type="text" 
                        value={invoiceId}
                        onChange={(e) => setInvoiceId(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Specific Fields: Security Alert */}
                {template === 'securityAlert' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
                      <input 
                        type="text" 
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input 
                        type="text" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Specific Fields: Invitation */}
                {template === 'invitation' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inviter Name</label>
                      <input 
                        type="text" 
                        value={inviterName}
                        onChange={(e) => setInviterName(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                      <input 
                        type="text" 
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Single Link Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Link (URL)</label>
                  <input 
                    type="url" 
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </>
            )}

            {mode === 'template' ? (
              <div className="flex gap-4 pt-2">
                <button 
                  type="button"
                  onClick={handlePreview}
                  disabled={status === 'loading'}
                  className="flex-1 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition"
                >
                  Preview HTML
                </button>
                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            )}
          </form>

          {status === 'loading' && actionType === 'send' && (
            <EmailSendingSkeleton />
          )}

          {status === 'success' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg space-y-2">
              <div className="font-semibold">{responseMsg}</div>
              {deliveryDetails?.isEthereal && deliveryDetails.previewUrl ? (
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded text-amber-900 text-xs mt-2">
                  <p className="font-medium mb-1">
                    ⚠️ Captured in Ethereal Test Sandbox:
                  </p>
                  <p className="mb-2">
                    This email was sent to a virtual sandbox inbox because live SMTP was not active when the message was processed.
                  </p>
                  <a
                    href={deliveryDetails.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded text-xs transition"
                  >
                    Open Sandbox Email Preview ↗
                  </a>
                </div>
              ) : (
                <div className="text-xs text-green-700 mt-1">
                  Sent via live Google SMTP from <span className="font-mono font-medium">{deliveryDetails?.sender || 'learncatterpiweb@gmail.com'}</span>. Check your inbox and spam folder.
                </div>
              )}
              {currentUser && (
                <div className="text-xs text-slate-500 pt-1 border-t border-green-100">
                  Tracked under user ID: <span className="font-mono">{currentUser.id}</span> (check the Database Tab to inspect your record).
                </div>
              )}
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg text-center">
              {responseMsg}
            </div>
          )}
        </div>

        {mode === 'template' && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 flex flex-col h-[500px]">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-100 rounded-t-xl flex justify-between items-center">
              <h3 className="font-semibold text-gray-700 text-sm">Live Preview</h3>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              {status === 'loading' && actionType === 'preview' ? (
                <EmailPreviewSkeleton />
              ) : !previewHtml ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm p-6 text-center">
                  Click "Preview HTML" to generate the rendering based on the fields provided.
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="px-4 py-2 border-b border-gray-200 bg-white">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">Subject</span>
                    <span className="text-sm text-gray-900">{previewSubject}</span>
                  </div>
                  <iframe 
                    title="Email Preview"
                    srcDoc={previewHtml}
                    className="w-full h-full bg-white"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
