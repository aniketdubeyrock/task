export type Role = 'USER' | 'ADMIN' | 'SUPERADMIN';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  progress: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  stats?: ProjectStats;
  _count?: {
    tasks: number;
  };
}

export interface TaskActivity {
  id: string;
  action: string;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  projectId: string;
  assigneeId?: string | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
    role?: Role;
  } | null;
  isOverdue?: boolean;
  activities?: TaskActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary {
  projectId: string;
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  overdue: number;
  progress: number;
  priorityDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  subject: string;
  bodyHtml: string;
  bodyText?: string | null;
  availableVariables: string[];
  updatedById?: string | null;
  updatedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  updatedAt: string;
}

export interface EmailLog {
  id: string;
  recipientEmail: string;
  templateKey: string;
  subject: string;
  status: 'SENT' | 'FAILED';
  errorMessage?: string | null;
  sentAt: string;
  template?: {
    name: string;
    key: string;
  } | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  errors?: Record<string, string>;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  actor?: {
    id: string;
    name: string;
    email: string;
  } | null;
  taskId?: string | null;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

