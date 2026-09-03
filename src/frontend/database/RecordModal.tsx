import React from 'react';
import { X } from 'lucide-react';

interface RecordModalProps {
  modal: { type: 'add' | 'edit', table: string, data: any };
  setModal: (modal: { type: 'add' | 'edit', table: string, data: any } | null) => void;
  jsonStr: string;
  setJsonStr: (str: string) => void;
  modalError: string;
  handleSave: () => void;
}

export function RecordModal({ modal, setModal, jsonStr, setJsonStr, modalError, handleSave }: RecordModalProps) {
  return (
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
  );
}
