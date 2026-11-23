import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Project } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { ProjectsSkeleton } from '../../../components/feedback/ProjectsSkeleton';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { useToast } from '../../../components/ui/Toast';
import {
  FolderKanban,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Search,
} from 'lucide-react';

interface ProjectsPageProps {
  onNavigate: (path: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigate }) => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Project State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [nameError, setNameError] = useState('');

  // Delete Project State
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get(`/projects${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      if (res.data?.success) {
        setProjects(res.data.data);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Project name is required');
      return;
    }

    setIsCreating(true);
    try {
      const res = await api.post('/projects', { name: name.trim(), description: description.trim() });
      if (res.data?.success) {
        toastSuccess('Project created successfully!');
        setIsCreateOpen(false);
        setName('');
        setDescription('');
        setNameError('');
        fetchProjects();
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/projects/${deletingProject.id}`);
      if (res.data?.success) {
        toastSuccess('Project and its tasks deleted successfully');
        setDeletingProject(null);
        setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-md shadow-saffron-500/25 shrink-0"
        >
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <ProjectsSkeleton />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={
            search
              ? 'No projects match your current search criteria.'
              : 'Create your first project to start organizing tasks and tracking progress.'
          }
          actionLabel="Create Project"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const stats = project.stats || {
              totalTasks: 0,
              completedTasks: 0,
              overdueTasks: 0,
              progress: 0,
            };

            return (
              <div
                key={project.id}
                className="card-saffron-glow bg-white dark:bg-slate-900 border border-amber-200/90 dark:border-slate-800 hover:border-saffron-400 dark:hover:border-saffron-500/60 rounded-3xl p-6 shadow-sm hover:shadow-xl dark:hover:shadow-black/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#f97316] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-orange-500/30 group-hover:scale-105 transition-transform shrink-0">
                      <FolderKanban className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {stats.overdueTasks > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2.5 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          {stats.overdueTasks} Overdue
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingProject(project);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-saffron-600 dark:group-hover:text-saffron-400 transition-colors line-clamp-1 mb-1.5">
                    {project.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[34px] mb-5 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Progress Bar */}
                  <div className="flex flex-col gap-1.5 mb-5 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-400">Completion</span>
                      <span className="text-saffron-600 dark:text-amber-400 font-extrabold">{stats.progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-saffron-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${stats.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400" />
                      {stats.completedTasks}/{stats.totalTasks} Tasks
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigate(`/projects/${project.id}`)}
                    className="inline-flex items-center gap-1.5 font-bold px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-xs hover:shadow-md transition-all active:scale-95"
                  >
                    <span>Open Board</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Project"
        description="Set up a workspace to track tasks, assign members, and monitor deadlines"
        maxWidth="md"
      >
        <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
          <Input
            label="Project Name"
            placeholder="e.g. Mobile App Redesign"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError('');
            }}
            error={nameError}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Outline project objectives or sprint goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-saffron-500/25 focus:border-saffron-500 hover:border-saffron-300 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isCreating}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Project Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.name}"? All associated tasks will be permanently removed.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

