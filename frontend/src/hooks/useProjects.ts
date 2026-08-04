'use client';
import { useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';

export function useProjects() {
  const { projects, meta, isLoading, searchQuery, statusFilter, currentPage, fetchProjects, setSearch, setStatusFilter, setPage } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [searchQuery, statusFilter, currentPage]);

  return {
    projects,
    meta,
    isLoading,
    searchQuery,
    statusFilter,
    currentPage,
    setSearch,
    setStatusFilter,
    setPage,
    refetch: fetchProjects,
  };
}
