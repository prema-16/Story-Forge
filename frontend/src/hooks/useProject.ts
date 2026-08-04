'use client';
import { useEffect } from 'react';
import { useStudioStore } from '../store/studioStore';

export function useProject(projectId: string) {
  const { project, script, scenes, thumbnail, voice, seo, isGenerating, loadProject } = useStudioStore();

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);

  return {
    project,
    script,
    scenes,
    thumbnail,
    voice,
    seo,
    isGenerating,
    reload: () => loadProject(projectId),
  };
}
