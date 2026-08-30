import React, { useState, useEffect } from 'react';
import { User, Save, RefreshCw } from 'lucide-react';
import { fetchAPI } from './AuthTab'; // Assuming fetchAPI is exported or we can just redefine it. Let me check AuthTab... wait, I'll just use a local fetchAPI.

const localFetchAPI = async (url: string, options?: RequestInit) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await localFetchAPI('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setFirstName(data.user.first_name || '');
        setLastName(data.user.last_name || '');
        setAvatarUrl(data.user.avatar_url || '');
      } else {
        setError('Failed to load profile. Are you logged in?');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await localFetchAPI('/api/auth/me', {
        method: 'PUT',
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl,
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccess('Profile updated successfully!');
        setProfile((prev: any) => ({ ...prev, ...data.user }));
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center border border-red-100 max-w-lg mx-auto">
        <h3 className="font-bold mb-2">Not Authenticated</h3>
        <p>Please log in via the Auth Testing tab to view and edit your user schema.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8 border-b pb-6">
          {avatarUrl || profile.avatar_url ? (
            <img 
              src={avatarUrl || profile.avatar_url} 
              alt="Profile" 
              className="w-16 h-16 rounded-full object-cover bg-gray-100 border border-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + (firstName || profile.email) + '&background=random';
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl">
              {(firstName?.[0] || profile.email?.[0] || '?').toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Profile</h2>
            <p className="text-sm text-gray-500 font-mono mt-1">{profile.email}</p>
          </div>
        </div>

        {error && <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">{error}</div>}
        {success && <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">{success}</div>}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button 
              type="button" 
              onClick={loadProfile}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="w-4 h-4" /> Reload
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4" /> Save Profile
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Read-Only Details</h3>
          <ul className="text-sm space-y-3 text-gray-600">
            <li className="flex justify-between">
              <span className="font-medium text-gray-500">User ID</span>
              <span className="font-mono text-xs">{profile.id}</span>
            </li>
            <li className="flex justify-between">
              <span className="font-medium text-gray-500">Role</span>
              <span className="capitalize">{profile.role}</span>
            </li>
            <li className="flex justify-between">
              <span className="font-medium text-gray-500">Verified</span>
              <span>{profile.email_verified ? 'Yes' : 'No'}</span>
            </li>
            <li className="flex justify-between">
              <span className="font-medium text-gray-500">Joined</span>
              <span>{new Date(profile.created_at).toLocaleDateString()}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
