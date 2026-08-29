import React from 'react';

export default function DocsTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 w-full max-w-4xl mx-auto text-left">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">API Documentation</h2>
        <p className="text-gray-600">
          Learn how to integrate this backend into your own frontend projects. 
          All endpoints accept and return JSON.
        </p>
      </div>

      <div className="space-y-8 text-sm">
        {/* General Setup */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">1. General Setup</h3>
          <p className="text-gray-600 mb-3">
            Since this API uses HTTP-only cookies for secure authentication, you <strong>must</strong> include credentials in your fetch requests if your frontend is hosted on a different port or domain.
          </p>
          <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`// Example base configuration for all requests
const BASE_URL = 'http://localhost:3000'; // Replace with your deployed URL

const fetchAPI = async (endpoint, options = {}) => {
  return fetch(BASE_URL + endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // CRITICAL: Required for cookies to be sent cross-origin
    credentials: 'include', 
  });
};`}
          </pre>
        </section>

        {/* Authentication */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">2. Authentication Endpoints</h3>
          
          <div className="space-y-6">
            {/* Register */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">POST</span>
                <code className="text-gray-800 font-semibold">/api/auth/register</code>
              </div>
              <p className="text-gray-600 mb-2">Creates a new user account.</p>
              <pre className="bg-gray-50 border border-gray-200 text-gray-800 p-4 rounded-lg overflow-x-auto">
{`await fetchAPI('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({ 
    email: 'user@example.com', 
    password: 'securepassword123' 
  })
});`}
              </pre>
            </div>

            {/* Login */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">POST</span>
                <code className="text-gray-800 font-semibold">/api/auth/login</code>
              </div>
              <p className="text-gray-600 mb-2">Authenticates a user and sets an HTTP-only session cookie.</p>
              <pre className="bg-gray-50 border border-gray-200 text-gray-800 p-4 rounded-lg overflow-x-auto">
{`await fetchAPI('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ 
    email: 'user@example.com', 
    password: 'securepassword123' 
  })
});`}
              </pre>
            </div>

            {/* Google Login */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">POST</span>
                <code className="text-gray-800 font-semibold">/api/auth/google</code>
              </div>
              <p className="text-gray-600 mb-2">Authenticates a user via Google OAuth ID token (credential).</p>
              <pre className="bg-gray-50 border border-gray-200 text-gray-800 p-4 rounded-lg overflow-x-auto">
{`await fetchAPI('/api/auth/google', {
  method: 'POST',
  body: JSON.stringify({ 
    credential: 'google.id.token.from.frontend.client'
  })
});`}
              </pre>
            </div>

            {/* Get Current User */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">GET</span>
                <code className="text-gray-800 font-semibold">/api/auth/me</code>
              </div>
              <p className="text-gray-600 mb-2">Retrieves the currently authenticated user based on their session cookie.</p>
              <pre className="bg-gray-50 border border-gray-200 text-gray-800 p-4 rounded-lg overflow-x-auto">
{`const res = await fetchAPI('/api/auth/me');
const data = await res.json();
console.log(data.user); // { id: "...", email: "user@example.com", role: "admin" }`}
              </pre>
            </div>
            
            {/* Logout */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">POST</span>
                <code className="text-gray-800 font-semibold">/api/auth/logout</code>
              </div>
              <p className="text-gray-600 mb-2">Clears the session cookie, logging the user out.</p>
              <pre className="bg-gray-50 border border-gray-200 text-gray-800 p-4 rounded-lg overflow-x-auto">
{`await fetchAPI('/api/auth/logout', { method: 'POST' });`}
              </pre>
            </div>
          </div>
        </section>

        {/* Admin & Database */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">3. Admin & Database Endpoints</h3>
          <p className="text-gray-600 mb-4">
            These endpoints require an authenticated user. Actions that modify the database require the user to have the <code className="bg-gray-100 px-1 py-0.5 rounded">admin</code> role.
          </p>
          
          <div className="space-y-6">
            {/* Database Dump */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">GET</span>
                <code className="text-gray-800 font-semibold">/api/admin/db-dump</code>
              </div>
              <p className="text-gray-600 mb-2">Retrieves database records. Admins see all records; normal users see only their own data.</p>
              <pre className="bg-gray-50 border border-gray-200 text-gray-800 p-4 rounded-lg overflow-x-auto">
{`const res = await fetchAPI('/api/admin/db-dump');
const data = await res.json();
console.log(data); // { success: true, isAdmin: true/false, users: [...], sessions: [...] }`}
              </pre>
            </div>

            {/* Create Record */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">POST</span>
                <code className="text-gray-800 font-semibold">/api/admin/records/:table</code>
              </div>
              <p className="text-gray-600 mb-2">Creates a new record in the specified table. <strong>Requires Admin.</strong></p>
              <pre className="bg-gray-50 border border-gray-200 text-gray-800 p-4 rounded-lg overflow-x-auto">
{`await fetchAPI('/api/admin/records/users', {
  method: 'POST',
  body: JSON.stringify({ email: 'new@example.com', role: 'user', ... })
});`}
              </pre>
            </div>

            {/* Update Record */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">PUT</span>
                <code className="text-gray-800 font-semibold">/api/admin/records/:table/:id</code>
              </div>
              <p className="text-gray-600 mb-2">Updates an existing record by its ID. <strong>Requires Admin.</strong></p>
              <pre className="bg-gray-50 border border-gray-200 text-gray-800 p-4 rounded-lg overflow-x-auto">
{`await fetchAPI('/api/admin/records/users/user_id_here', {
  method: 'PUT',
  body: JSON.stringify({ role: 'admin' })
});`}
              </pre>
            </div>

            {/* Delete Record */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">DELETE</span>
                <code className="text-gray-800 font-semibold">/api/admin/records/:table/:id</code>
              </div>
              <p className="text-gray-600 mb-2">Deletes a record by its ID. <strong>Requires Admin.</strong></p>
              <pre className="bg-gray-50 border border-gray-200 text-gray-800 p-4 rounded-lg overflow-x-auto">
{`await fetchAPI('/api/admin/records/users/user_id_here', {
  method: 'DELETE'
});`}
              </pre>
            </div>
          </div>
        </section>

        {/* Email */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">4. Email Endpoints</h3>
          
          <div className="space-y-6">
            {/* Custom Email */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">POST</span>
                <code className="text-gray-800 font-semibold">/api/email/test</code>
              </div>
              <p className="text-gray-600 mb-2">Sends a raw text email to a specified recipient.</p>
              <pre className="bg-gray-50 border border-gray-200 text-gray-800 p-4 rounded-lg overflow-x-auto">
{`await fetchAPI('/api/email/test', {
  method: 'POST',
  body: JSON.stringify({ 
    to: 'recipient@example.com',
    subject: 'Hello from API',
    message: 'This is the raw body text of the email.'
  })
});`}
              </pre>
            </div>

            {/* Templated Email */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">POST</span>
                <code className="text-gray-800 font-semibold">/api/email/template</code>
              </div>
              <p className="text-gray-600 mb-2">Sends an HTML email using one of the pre-built templates.</p>
              <pre className="bg-gray-50 border border-gray-200 text-gray-800 p-4 rounded-lg overflow-x-auto">
{`// Available templates: 'welcome', 'verifyEmail', 'passwordReset'
await fetchAPI('/api/email/template', {
  method: 'POST',
  body: JSON.stringify({ 
    to: 'recipient@example.com',
    template: 'welcome',
    data: {
      name: 'John Doe',
      appName: 'My Startup',
      // Include verifyLink or resetLink for the other templates
    }
  })
});`}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
