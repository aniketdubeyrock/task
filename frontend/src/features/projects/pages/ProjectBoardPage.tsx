import React, { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '../../../services/api';
import { Project, Task, TaskStatus, TaskPriority, User } from '../../../types';
import { cn } from '../../../utils/cn';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { PriorityBadge } from '../../../components/ui/Badge';
import { KanbanSkeleton } from '../../../components/feedback/KanbanSkeleton';
import { useToast } from '../../../components/ui/Toast';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Edit2,
  Trash2,
  GripVertical,
  CheckCircle2,
  Clock,
  User as UserIcon,
  FolderKanban,
} from 'lucide-react';

interface ProjectBoardPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const ProjectBoardPage: React.FC<ProjectBoardPageProps> = ({ projectId, onNavigate }) => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting Toolbar
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('dueDate');

  // Task Modal (Create / Edit)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('TODO');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [taskTitleError, setTaskTitleError] = useState('');
  const [taskDueDateError, setTaskDueDateError] = useState('');
  const [taskAssigneeError, setTaskAssigneeError] = useState('');

  // Delete Task
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  // DnD Sensors (with activation constraint so edit/delete buttons don't trigger drag)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const fetchProjectAndTasks = async () => {
    try {
      const [projectRes, tasksRes, usersRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks?sortBy=${sortBy}`),
        api.get('/users'),
      ]);

      if (projectRes.data?.success) setProject(projectRes.data.data);
      if (tasksRes.data?.success) setTasks(tasksRes.data.data);
      if (usersRes.data?.success) setUsers(usersRes.data.data);
    } catch (err: any) {
      toastError(err.message || 'Failed to load project board');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndTasks();
  }, [projectId, sortBy]);

  // Filter tasks in memory for instant responsiveness
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        search === '' ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase()));

      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'ALL' || t.assigneeId === assigneeFilter;

      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }, [tasks, search, priorityFilter, assigneeFilter]);

  // Group filtered tasks by status
  const todoTasks = useMemo(() => filteredTasks.filter((t) => t.status === 'TODO'), [filteredTasks]);
  const inProgressTasks = useMemo(() => filteredTasks.filter((t) => t.status === 'IN_PROGRESS'), [filteredTasks]);
  const doneTasks = useMemo(() => filteredTasks.filter((t) => t.status === 'DONE'), [filteredTasks]);

  // Project progress statistics calculation
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'DONE').length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const overdueCount = tasks.filter((t) => t.isOverdue).length;

  // Handle Drag & Drop status update with optimistic rollback
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = active.id as string;
    let newStatus: TaskStatus | null = null;

    // Check if dropped directly over a column container or another card
    if (over.id === 'TODO' || over.id === 'IN_PROGRESS' || over.id === 'DONE') {
      newStatus = over.id as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (!newStatus) return;

    const currentTask = tasks.find((t) => t.id === activeTaskId);
    if (!currentTask || currentTask.status === newStatus) return;

    const previousTasks = [...tasks];

    // Optimistically update local state immediately
    setTasks((prev) =>
      prev.map((t) => (t.id === activeTaskId ? { ...t, status: newStatus as TaskStatus } : t))
    );

    try {
      const res = await api.patch(`/tasks/${activeTaskId}/status`, { status: newStatus });
      if (!res.data?.success) {
        throw new Error('Failed to update status');
      }
      toastSuccess(`Task moved to ${newStatus.replace('_', ' ')}`);
    } catch (err: any) {
      // Rollback on failure
      setTasks(previousTasks);
      toastError(err.message || 'Failed to update task status');
    }
  };

  // Open modal for new task
  const openCreateTaskModal = (defaultStatus: TaskStatus = 'TODO') => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('MEDIUM');
    setTaskStatus(defaultStatus);
    setTaskDueDate('');
    setTaskAssigneeId('');
    setTaskTitleError('');
    setTaskDueDateError('');
    setTaskAssigneeError('');
    setIsTaskModalOpen(true);
  };

  // Open modal for editing task
  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    setTaskDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setTaskAssigneeId(task.assigneeId || '');
    setTaskTitleError('');
    setTaskDueDateError('');
    setTaskAssigneeError('');
    setIsTaskModalOpen(true);
  };

  // Quick 1-click Toggle Complete (mark as DONE / Reopen)
  const handleToggleComplete = async (task: Task) => {
    const newStatus: TaskStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await api.patch(`/tasks/${task.id}/status`, { status: newStatus });
      if (!res.data?.success) throw new Error('Failed to update task status');
      if (newStatus === 'DONE') {
        toastSuccess(`Task "${task.title}" completed within due date!`);
      } else {
        toastSuccess(`Task "${task.title}" reopened`);
      }
    } catch (err: any) {
      setTasks(previousTasks);
      toastError(err.message || 'Failed to update task status');
    }
  };

  // Save Task (Create or Update)
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!taskTitle.trim()) {
      setTaskTitleError('Task title is required');
      hasError = true;
    }

    if (!taskDueDate) {
      setTaskDueDateError('Due date is required');
      hasError = true;
    } else if (!editingTask) {
      const selected = new Date(taskDueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        setTaskDueDateError('Due date cannot be in the past');
        hasError = true;
      }
    }

    if (!taskAssigneeId) {
      setTaskAssigneeError('Please select a collaborator / assignee');
      hasError = true;
    }

    if (hasError) return;

    setIsSavingTask(true);
    try {
      const payload = {
        title: taskTitle.trim(),
        description: taskDescription.trim() || null,
        priority: taskPriority,
        status: taskStatus,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : null,
        assigneeId: taskAssigneeId || null,
      };

      if (editingTask) {
        const res = await api.put(`/tasks/${editingTask.id}`, payload);
        if (res.data?.success) {
          toastSuccess('Task updated successfully!');
          fetchProjectAndTasks();
        }
      } else {
        const res = await api.post(`/projects/${projectId}/tasks`, payload);
        if (res.data?.success) {
          toastSuccess('Task created and assigned to collaborator!');
          fetchProjectAndTasks();
        }
      }
      setIsTaskModalOpen(false);
    } catch (err: any) {
      toastError(err.message || 'Failed to save task');
    } finally {
      setIsSavingTask(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    setIsDeletingTask(true);
    try {
      const res = await api.delete(`/tasks/${deletingTask.id}`);
      if (res.data?.success) {
        toastSuccess('Task deleted successfully');
        setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
        setDeletingTask(null);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to delete task');
    } finally {
      setIsDeletingTask(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('/projects')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-saffron-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{project?.name || 'Project Board'}</h2>
            {overdueCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                {overdueCount} Overdue
              </span>
            )}
          </div>
          {project?.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">{project.description}</p>
          )}
        </div>

        <Button
          variant="primary"
          onClick={() => openCreateTaskModal('TODO')}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-md shadow-saffron-500/25 shrink-0"
        >
          Add Task
        </Button>
      </div>

      {/* Project Summary Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Total
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{totalCount}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                Completed
              </span>
              <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">{completedCount}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                In Progress
              </span>
              <span className="text-lg font-black text-amber-700 dark:text-amber-300">{inProgressTasks.length}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-orange-50/70 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-800/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider block">
                To Do
              </span>
              <span className="text-lg font-black text-orange-700 dark:text-orange-300">{todoTasks.length}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full md:w-64 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 flex flex-col gap-1.5 justify-center">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-400">Completion</span>
            <span className="text-saffron-600 dark:text-amber-400 font-extrabold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200/70 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-saffron-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-300 shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task Toolbar (Filters, Search & Sorting) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-crisp flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 sm:max-w-xs">
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="w-36">
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </Select>
          </div>

          <div className="w-44">
            <Select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
              <option value="ALL">All Assignees</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Sort by:</span>
          <div className="w-36">
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Created Date</option>
              <option value="title">Title</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns with Drag & Drop */}
      {isLoading ? (
        <KanbanSkeleton />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-start">
            {/* Column 1: TO DO */}
            <KanbanColumn
              id="TODO"
              title="To Do"
              count={todoTasks.length}
              indicatorColor="bg-slate-400"
              tasks={todoTasks}
              onAddTask={() => openCreateTaskModal('TODO')}
              onEditTask={openEditTaskModal}
              onDeleteTask={setDeletingTask}
              onToggleComplete={handleToggleComplete}
              onNavigate={onNavigate}
            />

            {/* Column 2: IN PROGRESS */}
            <KanbanColumn
              id="IN_PROGRESS"
              title="In Progress"
              count={inProgressTasks.length}
              indicatorColor="bg-saffron-500"
              tasks={inProgressTasks}
              onAddTask={() => openCreateTaskModal('IN_PROGRESS')}
              onEditTask={openEditTaskModal}
              onDeleteTask={setDeletingTask}
              onToggleComplete={handleToggleComplete}
              onNavigate={onNavigate}
            />

            {/* Column 3: DONE */}
            <KanbanColumn
              id="DONE"
              title="Done"
              count={doneTasks.length}
              indicatorColor="bg-emerald-500"
              tasks={doneTasks}
              onAddTask={() => openCreateTaskModal('DONE')}
              onEditTask={openEditTaskModal}
              onDeleteTask={setDeletingTask}
              onToggleComplete={handleToggleComplete}
              onNavigate={onNavigate}
            />
          </div>
        </DndContext>
      )}

      {/* Task Modal (Create & Edit) */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        description="Configure task details, assign team member, and set deadline"
        maxWidth="md"
      >
        <form onSubmit={handleSaveTask} className="flex flex-col gap-4">
          <Input
            label="Task Title"
            placeholder="e.g. Design Login Page"
            value={taskTitle}
            onChange={(e) => {
              setTaskTitle(e.target.value);
              setTaskTitleError('');
            }}
            error={taskTitleError}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 tracking-wide">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Provide extra details or requirements..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full text-xs p-3 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-saffron-500/25 focus:border-saffron-500 hover:border-saffron-300 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority"
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </Select>

            <Select
              label="Status"
              value={taskStatus}
              onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Due Date"
              type="date"
              value={taskDueDate}
              onChange={(e) => {
                setTaskDueDate(e.target.value);
                setTaskDueDateError('');
              }}
              error={taskDueDateError}
            />

            <Select
              label="Assignee / Collaborator"
              value={taskAssigneeId}
              onChange={(e) => {
                setTaskAssigneeId(e.target.value);
                setTaskAssigneeError('');
              }}
              error={taskAssigneeError}
            >
              <option value="">Select Collaborator...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role === 'SUPERADMIN' ? 'Superadmin' : 'Member'})
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSavingTask}>
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Task Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete task "${deletingTask?.title}"? This cannot be undone.`}
        isLoading={isDeletingTask}
      />
    </div>
  );
};

// ==========================================
// Sub-Components: KanbanColumn & TaskCard
// ==========================================

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  count: number;
  indicatorColor: string;
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  onNavigate?: (path: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  count,
  indicatorColor,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onNavigate,
}) => {
  return (
    <div
      id={id}
      className="bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 flex flex-col gap-3.5 min-h-[520px] shadow-xs"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className={`w-3 h-3 rounded-full ${indicatorColor} shadow-xs`} />
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{title}</h3>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
            {count}
          </span>
        </div>

        <button
          onClick={onAddTask}
          className="text-slate-500 dark:text-slate-400 hover:text-saffron-600 dark:hover:text-amber-400 p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-2xs hover:shadow-xs border border-transparent hover:border-saffron-200 dark:hover:border-slate-700"
          title={`Add task to ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Sortable Task List */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3 flex-1">
          {tasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center bg-white/40 dark:bg-slate-800/20">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No tasks in this column</p>
              <button
                onClick={onAddTask}
                className="mt-2 text-xs font-bold text-saffron-600 dark:text-amber-400 hover:underline"
              >
                + Add a task
              </button>
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onEdit={() => onEditTask(task)}
                onDelete={() => onDeleteTask(task)}
                onToggleComplete={() => onToggleComplete(task)}
                onNavigate={onNavigate}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
};

interface SortableTaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  onNavigate?: (path: string) => void;
}

const SortableTaskCard: React.FC<SortableTaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
  onNavigate,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const priorityBorderColors: Record<TaskPriority, string> = {
    HIGH: 'border-l-4 border-l-rose-500',
    MEDIUM: 'border-l-4 border-l-amber-500',
    LOW: 'border-l-4 border-l-slate-400',
  };

  const isCompleted = task.status === 'DONE';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'card-saffron-glow bg-white dark:bg-slate-800/95 rounded-2xl p-4 shadow-sm hover:shadow-lg dark:hover:shadow-black/50 border border-slate-200/90 dark:border-slate-700/80 hover:border-saffron-300 dark:hover:border-saffron-500/50 transition-all group flex flex-col gap-2.5 relative',
        priorityBorderColors[task.priority],
        isCompleted && 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-800/50'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <PriorityBadge priority={task.priority} size="sm" />
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Completed
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="text-slate-400 hover:text-saffron-600 dark:hover:text-amber-400 p-1 rounded-lg hover:bg-saffron-50 dark:hover:bg-slate-700 transition-colors"
            title="Edit Task"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab text-slate-400 hover:text-saffron-600 dark:hover:text-amber-400 p-1 rounded-lg hover:bg-saffron-50 dark:hover:bg-slate-700 active:cursor-grabbing"
            title="Drag Task"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      <h4
        onClick={() => onNavigate && onNavigate(`/tasks/${task.id}`)}
        className={cn(
          'text-sm font-bold text-slate-900 dark:text-white group-hover:text-saffron-700 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug cursor-pointer',
          isCompleted && 'line-through text-slate-400 dark:text-slate-500'
        )}
        title="Click to view full task details & activity history"
      >
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* 1-Click Complete / Reopen Action */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl transition-all shadow-2xs border cursor-pointer',
            isCompleted
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:shadow-xs'
          )}
          title={isCompleted ? 'Mark as Not Done' : '1-click Complete within due date'}
        >
          <CheckCircle2 className={cn('w-3.5 h-3.5', isCompleted ? 'text-slate-500' : 'text-emerald-600 dark:text-emerald-400')} />
          {isCompleted ? 'Reopen' : 'Mark Complete'}
        </button>

        {/* Due Date Indicator */}
        <div>
          {task.isOverdue && !isCompleted ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              Overdue
            </span>
          ) : formattedDueDate ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formattedDueDate}
            </span>
          ) : null}
        </div>
      </div>

      {/* Collaborator Badge Pill */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Collaborator:</span>
        {task.assignee ? (
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-orange-50/90 dark:bg-slate-700/70 border border-orange-200/80 dark:border-slate-600 shadow-2xs"
            title={`Assigned to: ${task.assignee.name} (${task.assignee.email})`}
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-saffron-500 to-amber-500 text-white font-extrabold text-[9px] flex items-center justify-center shadow-xs">
              {task.assignee.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
              {task.assignee.name}
            </span>
          </div>
        ) : (
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 italic flex items-center gap-1">
            <UserIcon className="w-3 h-3" /> Unassigned
          </span>
        )}
      </div>
    </div>
  );
};

