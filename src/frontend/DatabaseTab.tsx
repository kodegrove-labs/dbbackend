import React, { useState, useEffect } from 'react';
import { FlatView } from './database/FlatView';
import { RelationalView } from './database/RelationalView';
import { RecordModal } from './database/RecordModal';

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full max-w-full relative">
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

      {viewMode === 'flat' ? (
        <FlatView 
          data={data} 
          sortConfig={sortConfig} 
          handleSort={handleSort} 
          getSortedData={getSortedData} 
          openModal={openModal} 
          handleDelete={handleDelete} 
        />
      ) : (
        <RelationalView data={data} />
      )}

      {modal && (
        <RecordModal 
          modal={modal}
          setModal={setModal}
          jsonStr={jsonStr}
          setJsonStr={setJsonStr}
          modalError={modalError}
          handleSave={handleSave}
        />
      )}
    </div>
  );
}
