import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Task, TaskActivity, TaskPriority, TaskStatus, User } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../components/ui/Toast';
import { PriorityBadge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { CustomDatePicker } from '../../../components/ui/CustomDatePicker';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  User as UserIcon,
  FolderKanban,
  Edit2,
  Trash2,
  Activity,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TaskDetailPageProps {
  taskId: string;
  onNavigate: (path: string) => void;
}

export const TaskDetailPage: React.FC<TaskDetailPageProps> = ({ taskId, onNavigate }) => {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [task, setTask] = useState<Task | null>(null);
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Edit Task State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('MEDIUM');
  const [editDueDate, setEditDueDate] = useState('');
  const [editAssigneeId, setEditAssigneeId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editTitleError, setEditTitleError] = useState('');

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTaskData = async () => {
    try {
      setIsLoading(true);
      const [taskRes, actRes, usersRes] = await Promise.all([
        api.get(`/tasks/${taskId}`),
        api.get(`/tasks/${taskId}/activities`),
        api.get('/users'),
      ]);

      if (taskRes.data?.success) {
        const t = taskRes.data.data;
        setTask(t);
        setEditTitle(t.title);
        setEditDescription(t.description || '');
        setEditPriority(t.priority);
        setEditDueDate(t.dueDate ? t.dueDate.split('T')[0] : '');
        setEditAssigneeId(t.assignee?.id || '');

        // Fetch project name if projectId exists
        if (t.projectId) {
          try {
            const pRes = await api.get(`/projects/${t.projectId}`);
            if (pRes.data?.success) setProjectName(pRes.data.data.name);
          } catch {
            // Ignore optional project lookup
          }
        }
      }

      if (actRes.data?.success && Array.isArray(actRes.data.data)) {
        setActivities(actRes.data.data);
      }

      if (usersRes.data?.success && Array.isArray(usersRes.data.data)) {
        setUsers(usersRes.data.data);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to load task details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskData();
  }, [taskId]);

  const handleToggleComplete = async () => {
    if (!task) return;
    const isCompleted = task.status === 'DONE';
    const newStatus: TaskStatus = isCompleted ? 'TODO' : 'DONE';

    setTask((prev) => (prev ? { ...prev, status: newStatus } : null));

    try {
      await api.patch(`/tasks/${task.id}/status`, { status: newStatus });
      toastSuccess(
        isCompleted
          ? `Task "${task.title}" reopened`
          : `🎉 Task "${task.title}" marked as complete!`
      );
      // Refresh activity timeline
      const actRes = await api.get(`/tasks/${taskId}/activities`);
      if (actRes.data?.success) setActivities(actRes.data.data);
    } catch (err: any) {
      setTask((prev) => (prev ? { ...prev, status: task.status } : null));
      toastError(err.message || 'Failed to update task status');
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task || task.status === newStatus) return;

    setTask((prev) => (prev ? { ...prev, status: newStatus } : null));

    try {
      await api.patch(`/tasks/${task.id}/status`, { status: newStatus });
      toastSuccess(`Task moved to ${newStatus.replace('_', ' ')}`);
      const actRes = await api.get(`/tasks/${taskId}/activities`);
      if (actRes.data?.success) setActivities(actRes.data.data);
    } catch (err: any) {
      setTask((prev) => (prev ? { ...prev, status: task.status } : null));
      toastError(err.message || 'Failed to change status');
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      setEditTitleError('Task title is required');
      return;
    }

    setIsUpdating(true);
    try {
      const payload: any = {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        priority: editPriority,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
        assigneeId: editAssigneeId || null,
      };

      const res = await api.put(`/tasks/${taskId}`, payload);
      if (res.data?.success) {
        toastSuccess('Task updated successfully');
        setIsEditOpen(false);
        fetchTaskData();
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to update task');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    setIsDeleting(true);
    try {
      const res = await api.delete(`/tasks/${taskId}`);
      if (res.data?.success) {
        toastSuccess('Task deleted successfully');
        onNavigate('/tasks');
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-40 bg-white dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white dark:bg-slate-800 rounded-3xl" />
          <div className="h-96 bg-white dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-white">Task Not Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
          This task may have been removed or you do not have permission to view it.
        </p>
        <Button variant="primary" size="sm" onClick={() => onNavigate('/tasks')}>
          Back to Tasks
        </Button>
      </div>
    );
  }

  const isCompleted = task.status === 'DONE';
  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No due date set';

  return (
    <div className="flex flex-col gap-6">
      {/* Top Navigation & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <button
          onClick={() => onNavigate('/tasks')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-saffron-600 dark:hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Tasks</span>
        </button>

        <div className="flex items-center gap-2.5">
          {/* 1-Click Complete Toggle */}
          <button
            onClick={handleToggleComplete}
            type="button"
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs border ${
              isCompleted
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCompleted ? 'Reopen Task' : 'Mark as Complete'}</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 Cols): Task Overview & Description & Activity Log */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Main Task Header Card */}
          <div className="card-saffron-glow bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <PriorityBadge priority={task.priority} size="md" />

              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-xl uppercase tracking-wider ${
                  task.status === 'DONE'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : task.status === 'IN_PROGRESS'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {task.status.replace('_', ' ')}
              </span>

              {isCompleted && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Completed on time
                </span>
              )}

              {task.isOverdue && !isCompleted && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-xl border border-rose-200 dark:border-rose-800">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  Overdue
                </span>
              )}
            </div>

            <h1
              className={`text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight ${
                isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
              }`}
            >
              {task.title}
            </h1>

            {/* Description Section */}
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Description
              </span>
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {task.description || (
                  <span className="italic text-slate-400 dark:text-slate-500">
                    No detailed description provided for this task.
                  </span>
                )}
              </div>
            </div>

            {/* Due Date & Timestamp Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-slate-800 text-saffron-600 dark:text-amber-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Due Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formattedDueDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Created</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {task.createdAt ? formatDistanceToNow(new Date(task.createdAt), { addSuffix: true }) : 'Recently'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Audit Trail Timeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-saffron-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Activity & Audit Trail
                </h3>
              </div>
              <span className="text-xs text-slate-400">{activities.length} Events Logged</span>
            </div>

            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No activity recorded on this task yet.
              </p>
            ) : (
              <div className="flex flex-col gap-3.5">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-saffron-500 to-amber-500 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                      {act.user?.name ? act.user.name.slice(0, 2).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {act.user?.name || 'System User'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {act.createdAt
                            ? formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })
                            : ''}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                        <span className="font-semibold text-saffron-600 dark:text-amber-400 mr-1.5 uppercase tracking-wide text-[10px]">
                          [{act.action}]
                        </span>
                        {act.newValue || 'Action performed'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Collaborator, Project & Status Controls */}
        <div className="flex flex-col gap-6">
          {/* Collaborator / Assignee Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Assigned Collaborator
            </h3>

            {task.assignee ? (
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-orange-50/70 dark:bg-slate-800 border border-orange-200/80 dark:border-slate-700">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-saffron-500 via-amber-500 to-saffron-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-orange-500/20 flex-shrink-0">
                  {task.assignee.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {task.assignee.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {task.assignee.email}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-saffron-100 dark:bg-amber-950/60 text-saffron-800 dark:text-amber-300">
                    {task.assignee.role === 'SUPERADMIN' ? 'Superadmin' : 'Collaborator'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center">
                <UserIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-500">Unassigned Task</p>
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="mt-2 text-xs font-bold text-saffron-600 dark:text-amber-400 hover:underline"
                >
                  Assign Collaborator &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Quick Kanban Status Switcher */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Change Kanban Status
            </h3>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleStatusChange('TODO')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold border transition-all ${
                  task.status === 'TODO'
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>To Do</span>
                {task.status === 'TODO' && <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />}
              </button>

              <button
                onClick={() => handleStatusChange('IN_PROGRESS')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold border transition-all ${
                  task.status === 'IN_PROGRESS'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-300 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>In Progress</span>
                {task.status === 'IN_PROGRESS' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
              </button>

              <button
                onClick={() => handleStatusChange('DONE')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold border transition-all ${
                  task.status === 'DONE'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>Done</span>
                {task.status === 'DONE' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
              </button>
            </div>
          </div>

          {/* Project Workspace Link */}
          {task.projectId && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Project Workspace
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {projectName || 'Sprint Board'}
                  </h4>
                  <span className="text-xs text-slate-400">Interactive Kanban Workspace</span>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full mt-2"
                onClick={() => onNavigate(`/projects/${task.projectId}`)}
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Open Project Board
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Task Details"
        description="Update title, due date, collaborator, or priority"
      >
        <form onSubmit={handleUpdateTask} className="flex flex-col gap-4">
          <Input
            label="Task Title"
            value={editTitle}
            onChange={(e) => {
              setEditTitle(e.target.value);
              setEditTitleError('');
            }}
            error={editTitleError}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full text-xs p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-saffron-500/25 focus:border-saffron-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority"
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </Select>

            <CustomDatePicker
              label="Due Date / Deadline"
              value={editDueDate}
              onChange={(dateStr) => setEditDueDate(dateStr)}
              placeholder="Select deadline..."
            />
          </div>

          <Select
            label="Collaborator / Assignee"
            value={editAssigneeId}
            onChange={(e) => setEditAssigneeId(e.target.value)}
          >
            <option value="">Select Collaborator...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role === 'SUPERADMIN' ? 'Superadmin' : 'Member'})
              </option>
            ))}
          </Select>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isUpdating}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Task Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${task.title}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
};
