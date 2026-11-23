import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../../services/api';
import { Task, TaskPriority, TaskStatus } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../components/ui/Toast';
import { PriorityBadge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { CustomDropdown } from '../../../components/ui/CustomDropdown';
import {
  CheckSquare,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  User as UserIcon,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface TasksPageProps {
  onNavigate: (path: string) => void;
}

type FilterTab = 'ALL' | 'ASSIGNED_TO_ME' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';

export const TasksPage: React.FC<TasksPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const fetchTasks = async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      const res = await api.get('/tasks/my-tasks');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setTasks(res.data.data);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleComplete = async (task: Task) => {
    const isCompleted = task.status === 'DONE';
    const newStatus: TaskStatus = isCompleted ? 'TODO' : 'DONE';

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      await api.patch(`/tasks/${task.id}/status`, { status: newStatus });
      toastSuccess(
        isCompleted
          ? `Task "${task.title}" reopened`
          : `🎉 Task "${task.title}" completed within due date!`
      );
    } catch (err: any) {
      // Revert on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
      toastError(err.message || 'Failed to update task status');
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'DONE').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const todo = tasks.filter((t) => t.status === 'TODO').length;
    const overdue = tasks.filter((t) => t.isOverdue && t.status !== 'DONE').length;
    const assignedToMe = tasks.filter((t) => t.assignee?.id === user?.id).length;
    return { total, completed, inProgress, todo, overdue, assignedToMe };
  }, [tasks, user?.id]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Tab filter
      if (activeTab === 'ASSIGNED_TO_ME' && task.assignee?.id !== user?.id) return false;
      if (activeTab === 'TODO' && task.status !== 'TODO') return false;
      if (activeTab === 'IN_PROGRESS' && task.status !== 'IN_PROGRESS') return false;
      if (activeTab === 'DONE' && task.status !== 'DONE') return false;
      if (activeTab === 'OVERDUE' && (!task.isOverdue || task.status === 'DONE')) return false;

      // Priority filter
      if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesAssignee = task.assignee?.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesAssignee) return false;
      }

      return true;
    });
  }, [tasks, activeTab, priorityFilter, searchQuery, user?.id]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Tasks</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{stats.total}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assigned to Me</span>
          <span className="text-2xl font-black text-saffron-600 dark:text-amber-400 mt-1 block">{stats.assignedToMe}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">To Do</span>
          <span className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1 block">{stats.todo}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">In Progress</span>
          <span className="text-2xl font-black text-amber-500 mt-1 block">{stats.inProgress}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{stats.completed}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Overdue</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">{stats.overdue}</span>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-saffron-500 text-white shadow-saffron'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab('ASSIGNED_TO_ME')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ASSIGNED_TO_ME'
                ? 'bg-saffron-500 text-white shadow-saffron'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Assigned to Me ({stats.assignedToMe})
          </button>
          <button
            onClick={() => setActiveTab('TODO')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'TODO'
                ? 'bg-saffron-500 text-white shadow-saffron'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            To Do ({stats.todo})
          </button>
          <button
            onClick={() => setActiveTab('IN_PROGRESS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'IN_PROGRESS'
                ? 'bg-saffron-500 text-white shadow-saffron'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            In Progress ({stats.inProgress})
          </button>
          <button
            onClick={() => setActiveTab('DONE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'DONE'
                ? 'bg-saffron-500 text-white shadow-saffron'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Done ({stats.completed})
          </button>
          {stats.overdue > 0 && (
            <button
              onClick={() => setActiveTab('OVERDUE')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'OVERDUE'
                  ? 'bg-rose-600 text-white shadow-rose-500/20'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              Overdue ({stats.overdue})
            </button>
          )}
        </div>

        {/* Search & Priority Selector */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks or collaborator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500"
            />
          </div>

          <div className="w-36">
            <CustomDropdown
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { value: 'ALL', label: 'All Priorities' },
                { value: 'HIGH', label: 'High Priority', badge: 'HIGH', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' },
                { value: 'MEDIUM', label: 'Medium Priority' },
                { value: 'LOW', label: 'Low Priority' },
              ]}
              size="sm"
            />
          </div>

          <button
            onClick={() => fetchTasks(true)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-saffron-600 dark:hover:text-amber-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
            title="Refresh tasks"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-saffron-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Task List Table / Cards */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-saffron-50 dark:bg-slate-800 text-saffron-600 dark:text-amber-400 flex items-center justify-center mb-3">
            <CheckSquare className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No tasks found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4">
            {searchQuery
              ? 'No tasks matched your current search or filter criteria.'
              : 'You are all caught up! No tasks in this view.'}
          </p>
          <Button variant="primary" size="sm" onClick={() => onNavigate('/projects')}>
            Browse Projects
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'DONE';
            const formattedDueDate = task.dueDate
              ? new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : null;

            return (
              <div
                key={task.id}
                className={`card-saffron-glow bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'border-emerald-200/70 dark:border-emerald-900/50 bg-emerald-50/15 dark:bg-emerald-950/10'
                    : 'border-slate-200/90 dark:border-slate-800 hover:border-saffron-300 dark:hover:border-saffron-600'
                }`}
              >
                {/* Left: Complete checkbox + Title + Description */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    type="button"
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'border-2 border-slate-300 dark:border-slate-600 hover:border-saffron-500 hover:bg-saffron-50 dark:hover:bg-slate-800'
                    }`}
                    title={isCompleted ? 'Mark as Not Done' : '1-click Complete within due date'}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>

                  <div
                    onClick={() => onNavigate(`/tasks/${task.id}`)}
                    className="min-w-0 flex-1 cursor-pointer group/title"
                  >
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4
                        className={`text-sm font-bold tracking-tight text-slate-900 dark:text-white group-hover/title:text-saffron-600 dark:group-hover/title:text-amber-400 transition-colors ${
                          isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                      >
                        {task.title}
                      </h4>
                      <PriorityBadge priority={task.priority} size="sm" />
                      {isCompleted && (
                        <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          Completed on time
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Collaborator + Due Date + Action Button */}
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                  {/* Collaborator Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium hidden lg:inline">Collaborator:</span>
                    {task.assignee ? (
                      <div
                        className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-orange-50/90 dark:bg-slate-800 border border-orange-200/80 dark:border-slate-700 shadow-2xs"
                        title={`Assigned to: ${task.assignee.name} (${task.assignee.email})`}
                      >
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-saffron-500 to-amber-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs">
                          {task.assignee.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                          {task.assignee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 italic flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5" /> Unassigned
                      </span>
                    )}
                  </div>

                  {/* Due Date Indicator */}
                  <div className="flex items-center">
                    {task.isOverdue && !isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-xl border border-rose-200 dark:border-rose-800">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        Overdue ({formattedDueDate})
                      </span>
                    ) : formattedDueDate ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formattedDueDate}
                      </span>
                    ) : null}
                  </div>

                  {/* 1-Click Complete Toggle */}
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs border ${
                      isCompleted
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent hover:shadow-xs'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isCompleted ? 'Reopen' : 'Complete'}</span>
                  </button>

                  {/* View Details Link */}
                  <button
                    onClick={() => onNavigate(`/tasks/${task.id}`)}
                    className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-saffron-50 hover:bg-saffron-100 text-saffron-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-400 border border-saffron-200/80 dark:border-slate-700 transition-colors shadow-2xs"
                    title="View Task Details & Activity History"
                  >
                    <span>Details</span>
                  </button>

                  {/* Open Board Link */}
                  {task.projectId && (
                    <button
                      onClick={() => onNavigate(`/projects/${task.projectId}`)}
                      className="p-1.5 text-slate-400 hover:text-saffron-600 dark:hover:text-amber-400 rounded-xl hover:bg-saffron-50 dark:hover:bg-slate-800 transition-colors"
                      title="Open in Project Board"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
