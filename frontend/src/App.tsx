import React from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { ProjectsPage } from './features/projects/pages/ProjectsPage';
import { ProjectBoardPage } from './features/projects/pages/ProjectBoardPage';
import { EmailTemplatesPage } from './features/admin/pages/EmailTemplatesPage';
import { TasksPage } from './features/tasks/pages/TasksPage';
import { TaskDetailPage } from './features/tasks/pages/TaskDetailPage';
import { FullScreenLoader } from './components/ui/AnimatedLoader';
import { ServerErrorModal } from './components/feedback/ServerErrorModal';

// Wrapper for ProjectBoardPage to extract :id from react-router-dom params
const ProjectBoardWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <AppLayout
      title="Project Workspace"
      subtitle="Interactive Kanban board with optimistic status updates and task tracking"
    >
      <ProjectBoardPage projectId={id || ''} onNavigate={navigate} />
    </AppLayout>
  );
};

// Wrapper for TaskDetailPage to extract :id from react-router-dom params
const TaskDetailWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <AppLayout
      title="Task Details & History"
      subtitle="Comprehensive view, collaborator assignment, and audit trail"
    >
      <TaskDetailPage taskId={id || ''} onNavigate={navigate} />
    </AppLayout>
  );
};

export const App: React.FC = () => {
  const { user, isLoading, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  // Global 500 Error Modal State
  const [serverError, setServerError] = React.useState<{
    isOpen: boolean;
    endpoint?: string;
    message?: string;
  }>({ isOpen: false });

  React.useEffect(() => {
    const handleServerError = (e: Event) => {
      const customEvent = e as CustomEvent<{ endpoint?: string; message?: string }>;
      setServerError({
        isOpen: true,
        endpoint: customEvent.detail?.endpoint,
        message: customEvent.detail?.message,
      });
    };

    window.addEventListener('taskflow:server-error', handleServerError);
    return () => window.removeEventListener('taskflow:server-error', handleServerError);
  }, []);

  if (isLoading) {
    return <FullScreenLoader message="Connecting to TaskFlow Workspace..." />;
  }

  return (
    <>
      <ServerErrorModal
        isOpen={serverError.isOpen}
        onClose={() => setServerError({ isOpen: false })}
        endpoint={serverError.endpoint}
        errorMessage={serverError.message}
      />

      {/* Unauthenticated routes */}
      {!user ? (
        <Routes>
          <Route path="/login" element={<LoginPage onNavigate={navigate} />} />
          <Route path="/register" element={<RegisterPage onNavigate={navigate} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        /* Authenticated routes */
        <Routes>
          {/* Auth redirects for logged in users */}
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/register" element={<Navigate to="/dashboard" replace />} />

          {/* Workspace Routes */}
          <Route
            path="/dashboard"
            element={
              <AppLayout
                title="Analytics Dashboard"
                subtitle="Overview of system workload, project status distribution, and upcoming deadlines"
              >
                <DashboardPage onNavigate={navigate} />
              </AppLayout>
            }
          />

          <Route
            path="/projects"
            element={
              <AppLayout
                title="Projects Overview"
                subtitle="Track team progress, deadlines, and milestone completions"
              >
                <ProjectsPage onNavigate={navigate} />
              </AppLayout>
            }
          />

          <Route path="/projects/:id" element={<ProjectBoardWrapper />} />

          <Route
            path="/tasks"
            element={
              <AppLayout
                title="My Tasks & Deliverables"
                subtitle="Track personal assignments, collaborator tasks, and deadlines"
              >
                <TasksPage onNavigate={navigate} />
              </AppLayout>
            }
          />

          <Route path="/tasks/:id" element={<TaskDetailWrapper />} />

          {/* Superadmin Only: Email Templates */}
          <Route
            path="/admin/email-templates"
            element={
              isSuperAdmin ? (
                <AppLayout
                  title="Email Template Management"
                  subtitle="Manage dynamic HTML notifications, placeholder tokens, and test SMTP deliverability"
                >
                  <EmailTemplatesPage />
                </AppLayout>
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      )}
    </>
  );
};
