import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

interface SortableHeaderProps {
  table: string;
  sortKey: string;
  label: string;
  className?: string;
  sortConfig: { [table: string]: { key: string, direction: 'asc' | 'desc' } };
  handleSort: (table: string, key: string) => void;
}

export function SortableHeader({ table, sortKey, label, className = '', sortConfig, handleSort }: SortableHeaderProps) {
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
}
