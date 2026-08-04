'use client';

import { useEffect } from 'react';
import { useStudioStore } from '@/store/studioStore';
import toast from 'react-hot-toast';

export const KeyboardShortcutsHandler: React.FC = () => {
  const {
    isPlaying,
    setIsPlaying,
    undo,
    redo,
    currentTime,
    setCurrentTime,
    selectedClipId,
    deleteClip,
    splitClip,
    addMarker,
    createSnapshot,
  } = useStudioStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger shortcuts when typing inside text inputs/textareas
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      // Space: Play / Pause
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }

      // Undo / Redo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      // Cmd + S: Save / Snapshot
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        createSnapshot(`Auto-Save ${new Date().toLocaleTimeString()}`);
        toast.success('Studio project saved!');
      }

      // Delete Clip
      if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedClipId) {
          e.preventDefault();
          deleteClip(selectedClipId);
        }
      }

      // S: Split Clip
      if (e.key.toLowerCase() === 's' && !e.metaKey && !e.ctrlKey) {
        if (selectedClipId) {
          e.preventDefault();
          splitClip(selectedClipId, currentTime);
        }
      }

      // M: Add Marker
      if (e.key.toLowerCase() === 'm' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        addMarker(currentTime, `Marker at ${currentTime.toFixed(1)}s`);
      }

      // Frame Stepping (Left / Right Arrow)
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime(Math.max(0, currentTime - 1 / 30));
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime(currentTime + 1 / 30);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, setIsPlaying, undo, redo, currentTime, setCurrentTime, selectedClipId, deleteClip, splitClip, addMarker, createSnapshot]);

  return null;
};
