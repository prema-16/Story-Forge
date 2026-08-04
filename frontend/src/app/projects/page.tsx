'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  MoreVertical,
  Trash2,
  Copy,
  FolderOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AppLayout } from '../../components/layout/app-layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { SkeletonCard } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown';
import { useProjectStore } from '../../store/projectStore';
import { Project } from '../../lib/api';

const statusTabs = [
  { id: '', label: 'All Projects' },
  { id: 'draft', label: 'Drafts' },
  { id: 'generating', label: 'Generating' },
  { id: 'completed', label: 'Completed' },
];

export default function ProjectsPage() {
  const {
    projects,
    isLoading,
    searchQuery,
    statusFilter,
    meta,
    fetchProjects,
    setSearch,
    setStatusFilter,
    setPage,
    deleteProject,
    duplicateProject,
  } = useProjectStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, searchQuery]);

  return (
    <AppLayout title="Projects" subtitle="Manage all your AI video generation workflows in one place">
      <div className="space-y-6 pb-12">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl bg-white/[0.04] border border-white/[0.07]">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search + Controls */}
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search by title or topic..."
              leftIcon={<Search className="h-3.5 w-3.5" />}
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full sm:w-64 text-xs"
            />
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-white/[0.04] border border-white/[0.07] p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-purple-600/30 text-purple-300' : 'text-white/40 hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-purple-600/30 text-purple-300' : 'text-white/40 hover:text-white'
                }`}
                title="List View"
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
            <Link href="/projects/new">
              <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Project Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="h-8 w-8 text-purple-400" />}
            title="No projects found"
            description="Create your first video project to launch the AI Director orchestrator."
            action={{
              label: 'Create New Project',
              onClick: () => (window.location.href = '/projects/new'),
            }}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {projects.map((proj) => (
                <motion.div
                  key={proj._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card hover glass className="h-full flex flex-col justify-between group">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <Badge
                          variant={
                            proj.status === 'completed'
                              ? 'completed'
                              : proj.status === 'generating'
                              ? 'generating'
                              : 'draft'
                          }
                          dot
                        >
                          {proj.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => duplicateProject(proj._id)}>
                              <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              destructive
                              onClick={() => deleteProject(proj._id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <Link href={`/projects/${proj._id}`}>
                        <h3 className="text-base font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                          {proj.title}
                        </h3>
                        <p className="text-xs text-white/50 line-clamp-2 mt-1">
                          {proj.idea}
                        </p>
                      </Link>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/40">
                      <span className="capitalize">{proj.genre} • {proj.videoLength}m</span>
                      <Link
                        href={`/projects/${proj._id}`}
                        className="text-purple-400 font-medium flex items-center gap-1 hover:text-purple-300"
                      >
                        Open Studio <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* List View */
          <div className="glass rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
            {projects.map((proj) => (
              <div
                key={proj._id}
                className="flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                  <Badge
                    variant={
                      proj.status === 'completed'
                        ? 'completed'
                        : proj.status === 'generating'
                        ? 'generating'
                        : 'draft'
                    }
                    dot
                  >
                    {proj.status}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/projects/${proj._id}`}
                      className="text-sm font-semibold text-white hover:text-purple-300 transition-colors truncate block"
                    >
                      {proj.title}
                    </Link>
                    <span className="text-xs text-white/40 truncate block">
                      {proj.idea}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className="text-xs text-white/40 capitalize hidden md:inline">
                    {proj.genre} • {proj.videoLength}m
                  </span>
                  <Link href={`/projects/${proj._id}`}>
                    <Button variant="secondary" size="sm">
                      Open Studio
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded-lg text-white/30 hover:text-white hover:bg-white/10">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => duplicateProject(proj._id)}>
                        <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        destructive
                        onClick={() => deleteProject(proj._id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Meta */}
        {meta && meta.pages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            {Array.from({ length: meta.pages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPage(idx + 1)}
                className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
                  meta.page === idx + 1
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
