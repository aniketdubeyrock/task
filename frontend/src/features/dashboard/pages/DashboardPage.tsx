import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Project } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/ui/Button';
import { DashboardSkeleton } from '../../../components/feedback/DashboardSkeleton';
import { useToast } from '../../../components/ui/Toast';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Plus,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, isSuperAdmin } = useAuth();
  const { error: toastError } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/projects');
        if (res.data?.success) {
          setProjects(res.data.data);
        }
      } catch (err: any) {
        toastError(err.message || 'Failed to load dashboard metrics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Compute aggregated system metrics
  const totalProjects = projects.length;
  let totalTasks = 0;
  let completedTasks = 0;
  let overdueTasks = 0;

  projects.forEach((p) => {
    if (p.stats) {
      totalTasks += p.stats.totalTasks;
      completedTasks += p.stats.completedTasks;
      overdueTasks += p.stats.overdueTasks;
    }
  });

  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressTasks = Math.max(0, totalTasks - completedTasks);

  // Chart Data
  const statusChartData = [
    { name: 'Completed', value: completedTasks, color: '#10b981' },
    { name: 'Active / To Do', value: inProgressTasks, color: '#f97316' },
    { name: 'Overdue', value: overdueTasks, color: '#ef4444' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-stone-900 to-navy-950 text-white rounded-3xl p-8 shadow-saffron border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-500/20 text-saffron-300 text-xs font-bold mb-3 border border-saffron-500/30">
            <TrendingUp className="w-3.5 h-3.5 text-saffron-400" />
            <span>TaskFlow Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Developer'}! 👋
          </h2>
          <p className="text-sm text-slate-300 mt-1.5 max-w-xl leading-relaxed">
            Here&apos;s the current pulse of your workspace. You have{' '}
            <strong className="text-white">{totalProjects} projects</strong> active with{' '}
            <strong className="text-saffron-300 font-bold">{overallProgress}% overall completion</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          <Button
            variant="primary"
            onClick={() => onNavigate('/projects')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Explore Projects
          </Button>
          {isSuperAdmin && (
            <Button
              variant="outline"
              className="bg-slate-800/80 text-white border-slate-700 hover:bg-slate-700 hover:text-saffron-300"
              onClick={() => onNavigate('/admin/email-templates')}
              leftIcon={<ShieldCheck className="w-4 h-4 text-saffron-400" />}
            >
              Email Templates
            </Button>
          )}
        </div>

        {/* Saffron Ambient Glow */}
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-saffron-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Overdue Warning Alert Bar if overdue tasks exist */}
          {overdueTasks > 0 && (
            <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-4 flex items-center justify-between text-rose-900 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Action Required: {overdueTasks} Overdue Tasks Detected</h4>
                  <p className="text-xs text-rose-700">
                    Tasks with past due dates are pending completion. Review your project boards.
                  </p>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onNavigate('/projects')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Review Tasks
              </Button>
            </div>
          )}

          {/* Metric Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="card-saffron-glow bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-saffron-50 dark:bg-slate-800 text-saffron-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 border border-saffron-200/80 dark:border-slate-700 shadow-xs">
                <FolderKanban className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Projects
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{totalProjects}</span>
              </div>
            </div>

            <div className="card-saffron-glow bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-200/80 dark:border-slate-700 shadow-xs">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Tasks
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{totalTasks}</span>
              </div>
            </div>

            <div className="card-saffron-glow bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-200/80 dark:border-slate-700 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Completed
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedTasks}</span>
              </div>
            </div>

            <div className="card-saffron-glow bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-slate-800 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 border border-rose-200/80 dark:border-slate-700 shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Overdue Tasks
                </span>
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{overdueTasks}</span>
              </div>
            </div>
          </div>

          {/* Charts & Recent Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Projects List */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-crisp flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Projects</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Live progress across active sprint boards</p>
                  </div>
                  <button
                    onClick={() => onNavigate('/projects')}
                    className="text-xs font-bold text-saffron-600 dark:text-amber-400 hover:text-saffron-700 transition-colors"
                  >
                    View All &rarr;
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {projects.slice(0, 4).map((project) => (
                    <div
                      key={project.id}
                      onClick={() => onNavigate(`/projects/${project.id}`)}
                      className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-saffron-50/40 dark:hover:bg-slate-800/60 hover:border-saffron-200 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-saffron-50 dark:bg-slate-800 border border-saffron-200/80 dark:border-slate-700 text-saffron-700 dark:text-amber-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                          {project.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{project.name}</h4>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {project.stats?.completedTasks || 0}/{project.stats?.totalTasks || 0} tasks finished
                          </span>
                        </div>
                      </div>

                      <div className="w-full sm:w-44 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                          <span>Progress</span>
                          <span className="text-saffron-600 dark:text-amber-400">{project.stats?.progress || 0}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-saffron-500 to-amber-500 rounded-full transition-all duration-300"
                            style={{ width: `${project.stats?.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Task Health Donut Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-crisp flex flex-col">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Task Distribution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Breakdown by current workflow status</p>

              <div className="h-56 flex items-center justify-center">
                {totalTasks === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500">No task data available yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Done</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />
                  <span>Active</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Overdue</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

