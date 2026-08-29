import React, { useState } from 'react';

export default function EmailTab() {
  const [mode, setMode] = useState<'custom' | 'template'>('template');
  const [to, setTo] = useState('guptaharshit279@gmail.com');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseMsg, setResponseMsg] = useState('');
  
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
  
  // API Key State
  const [apiKey, setApiKey] = useState('my-secret-service-key');

  const handlePreview = async () => {
    setStatus('loading');
    setResponseMsg('');
    setPreviewHtml('');
    setPreviewSubject('');
    
    try {
      const payload = {
        template,
        data: {
          name,
          appName,
          verifyLink: template === 'verifyEmail' ? link : undefined,
          resetLink: template === 'passwordReset' ? link : undefined,
          dashboardLink: template === 'welcome' ? link : undefined
        }
      };

      const res = await fetch('/api/email/preview', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStatus('idle');
        setPreviewSubject(data.subject);
        setPreviewHtml(data.html);
      } else {
        setStatus('error');
        setResponseMsg(data.error || 'Failed to generate preview');
      }
    } catch (err: any) {
      setStatus('error');
      setResponseMsg('Network error: ' + err.message);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setResponseMsg('');
    
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
            dashboardLink: template === 'welcome' ? link : undefined
          }
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStatus('success');
        setResponseMsg('Email sent successfully! (Check your inbox)');
      } else {
        setStatus('error');
        setResponseMsg(data.error || 'Failed to send email');
      }
    } catch (err: any) {
      setStatus('error');
      setResponseMsg('Network error: ' + err.message);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-8 w-full mx-auto ${mode === 'template' ? 'max-w-5xl' : 'max-w-xl'}`}>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-gray-800">Test Email API</h2>
        <div className="flex justify-center mt-4 bg-gray-100 p-1 rounded-lg max-w-sm mx-auto">
          <button 
            type="button"
            onClick={() => { setMode('template'); setPreviewHtml(''); }}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${mode === 'template' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Pre-built Templates
          </button>
          <button 
            type="button"
            onClick={() => { setMode('custom'); setPreviewHtml(''); }}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${mode === 'custom' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Custom Message
          </button>
        </div>
      </div>

      <div className={`grid ${mode === 'template' ? 'md:grid-cols-2 gap-8' : 'grid-cols-1'}`}>
        <div>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-6">
              <label className="block text-sm font-medium text-blue-900 mb-1">Service API Key</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-blue-900"
                placeholder="Enter API Key to authorize"
              />
              <p className="text-xs text-blue-600 mt-1">Required to connect to the email microservice securely.</p>
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
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                {(template === 'verifyEmail' || template === 'passwordReset' || template === 'welcome') && (
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
                )}
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

          {status === 'success' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg text-center">
              {responseMsg}
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
              {!previewHtml ? (
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
