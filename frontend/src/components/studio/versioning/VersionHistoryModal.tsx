'use client';

import React, { useState } from 'react';
import { useStudioStore } from '@/store/studioStore';
import { History, GitCommit, RotateCcw, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ isOpen, onClose }) => {
  const { snapshots, createSnapshot, restoreSnapshot } = useStudioStore();
  const [snapshotName, setSnapshotName] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!snapshotName) return;
    createSnapshot(snapshotName);
    setSnapshotName('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="h-5 w-5 text-purple-400" /> Project Snapshots & Version History
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Create Snapshot input */}
        <div className="flex gap-2">
          <Input
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            placeholder="Snapshot name (e.g., v1.1 - Added BGM)..."
            className="text-xs bg-slate-950 border-white/10 text-white"
          />
          <Button variant="primary" size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-1" /> Save
          </Button>
        </div>

        {/* Snapshot list */}
        <div className="space-y-2 max-h-64 overflow-y-auto pt-2">
          {snapshots.map((snap) => (
            <div
              key={snap.id}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <GitCommit className="h-4 w-4 text-purple-400" />
                  <span className="font-semibold text-xs text-white">{snap.name}</span>
                </div>
                <span className="text-[10px] text-white/40 font-mono pl-6">
                  {new Date(snap.timestamp).toLocaleString()}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  restoreSnapshot(snap.id);
                  onClose();
                }}
                className="text-xs text-purple-300 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restore
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
