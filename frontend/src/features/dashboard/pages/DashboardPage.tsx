import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  RotateCw,
  Database,
  Activity,
  Server,
  ArrowUpRight,
  Zap,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, isSuperAdmin } = useAuth();
  const { error: toastError } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [hoveredStatusIndex, setHoveredStatusIndex] = useState<number | null>(null);

  const toggleFlip = (cardKey: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

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
    <div className="flex flex-col gap-8 pb-10">
      {/* Welcome Banner with Animated Motion */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white rounded-3xl p-8 shadow-saffron border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group"
      >
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
            className="shadow-md shadow-saffron-500/30 hover:scale-105 transition-transform"
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

        {/* Ambient Glow */}
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-saffron-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
      </motion.div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Overdue Warning Alert Bar if overdue tasks exist */}
          {overdueTasks > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200/90 dark:border-rose-900/60 rounded-2xl p-4 flex items-center justify-between text-rose-900 dark:text-rose-200 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0 animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Action Required: {overdueTasks} Overdue Tasks Detected</h4>
                  <p className="text-xs text-rose-700 dark:text-rose-300">
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
            </motion.div>
          )}

          {/* Interactive 3D Flip Metric Cards (Hover & Click) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Total Projects */}
            <div className="group perspective-1000 h-[162px]">
              <div
                onClick={() => toggleFlip('projects')}
                className={`relative w-full h-full transform-style-3d transition-transform duration-700 ease-in-out cursor-pointer select-none group-hover-flip ${
                  flippedCards['projects'] ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden card-saffron-glow bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group-hover:border-saffron-400 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-saffron-50 dark:bg-slate-800 text-saffron-600 dark:text-amber-400 flex items-center justify-center border border-saffron-200/80 dark:border-slate-700 shadow-xs">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-saffron-600 dark:group-hover:text-amber-400 transition-colors">
                      <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-700" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                      Total Projects
                    </span>
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{totalProjects}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Back Side (Deep Extra Info) */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-saffron-50 via-amber-50 to-orange-100/70 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 border-2 border-saffron-300 dark:border-saffron-500/60 rounded-3xl p-5 shadow-lg flex flex-col justify-between text-left overflow-hidden">
                  <div className="flex items-center justify-between border-b border-saffron-200/80 dark:border-slate-700 pb-2">
                    <span className="text-xs font-extrabold text-saffron-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-orange-500" /> Project Telemetry
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Live</span>
                  </div>
                  <div className="space-y-2 py-1 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Live Sprints:</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{totalProjects} Boards</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Avg Tasks/Sprint:</span>
                      <strong className="text-saffron-600 dark:text-amber-400 font-bold">
                        {totalProjects > 0 ? (totalTasks / totalProjects).toFixed(1) : 0}
                      </strong>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-saffron-700 dark:text-amber-400 pt-2 border-t border-saffron-200/60 dark:border-slate-700">
                    <span className="truncate">Neon DB Synced</span>
                    <span className="flex-shrink-0">&larr; Flip back</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Total Tasks */}
            <div className="group perspective-1000 h-[162px]">
              <div
                onClick={() => toggleFlip('tasks')}
                className={`relative w-full h-full transform-style-3d transition-transform duration-700 ease-in-out cursor-pointer select-none group-hover-flip ${
                  flippedCards['tasks'] ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden card-saffron-glow bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group-hover:border-amber-400 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/80 dark:border-slate-700 shadow-xs">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-700" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                      Total Tasks
                    </span>
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{totalTasks}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                        In Pipeline
                      </span>
                    </div>
                  </div>
                </div>

                {/* Back Side (Deep Extra Info) */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/70 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 border-2 border-amber-300 dark:border-amber-500/60 rounded-3xl p-5 shadow-lg flex flex-col justify-between text-left overflow-hidden">
                  <div className="flex items-center justify-between border-b border-amber-200/80 dark:border-slate-700 pb-2">
                    <span className="text-xs font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-500" /> Pipeline Matrix
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Live</span>
                  </div>
                  <div className="space-y-2 py-1 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>In Progress:</span>
                      <strong className="text-amber-600 dark:text-amber-400 font-bold">{inProgressTasks} items</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Completion Rate:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{overallProgress}%</strong>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-amber-700 dark:text-amber-400 pt-2 border-t border-amber-200/60 dark:border-slate-700">
                    <span className="truncate">Auto-Synced</span>
                    <span className="flex-shrink-0">&larr; Flip back</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Completed */}
            <div className="group perspective-1000 h-[162px]">
              <div
                onClick={() => toggleFlip('completed')}
                className={`relative w-full h-full transform-style-3d transition-transform duration-700 ease-in-out cursor-pointer select-none group-hover-flip ${
                  flippedCards['completed'] ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden card-saffron-glow bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group-hover:border-emerald-400 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/80 dark:border-slate-700 shadow-xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-700" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                      Completed
                    </span>
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{completedTasks}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                        Delivered
                      </span>
                    </div>
                  </div>
                </div>

                {/* Back Side (Deep Extra Info) */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/70 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 border-2 border-emerald-300 dark:border-emerald-500/60 rounded-3xl p-5 shadow-lg flex flex-col justify-between text-left overflow-hidden">
                  <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-slate-700 pb-2">
                    <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-500" /> Sprint Velocity
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Live</span>
                  </div>
                  <div className="space-y-2 py-1 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Shipped Tasks:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{completedTasks} Done</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Velocity Index:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">100% On-Target</strong>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700 dark:text-emerald-400 pt-2 border-t border-emerald-200/60 dark:border-slate-700">
                    <span className="truncate">Clean Sprint Run</span>
                    <span className="flex-shrink-0">&larr; Flip back</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Overdue Tasks */}
            <div className="group perspective-1000 h-[162px]">
              <div
                onClick={() => toggleFlip('overdue')}
                className={`relative w-full h-full transform-style-3d transition-transform duration-700 ease-in-out cursor-pointer select-none group-hover-flip ${
                  flippedCards['overdue'] ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden card-saffron-glow bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group-hover:border-rose-400 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-slate-800 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200/80 dark:border-slate-700 shadow-xs">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-700" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                      Overdue Tasks
                    </span>
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-3xl font-black text-rose-600 dark:text-rose-400 leading-none">{overdueTasks}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
                        Attention
                      </span>
                    </div>
                  </div>
                </div>

                {/* Back Side (Deep Extra Info) */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-rose-50 via-red-50 to-rose-100/70 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 border-2 border-rose-300 dark:border-rose-500/60 rounded-3xl p-5 shadow-lg flex flex-col justify-between text-left overflow-hidden">
                  <div className="flex items-center justify-between border-b border-rose-200/80 dark:border-slate-700 pb-2">
                    <span className="text-xs font-extrabold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> SLA Risk Matrix
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Live</span>
                  </div>
                  <div className="space-y-2 py-1 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Past Due:</span>
                      <strong className="text-rose-600 dark:text-rose-400 font-bold">{overdueTasks} tasks</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Remediation:</span>
                      <strong className="text-rose-600 dark:text-rose-400 font-bold">Action Needed</strong>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-rose-700 dark:text-rose-400 pt-2 border-t border-rose-200/60 dark:border-slate-700">
                    <span className="truncate">Alerts Active</span>
                    <span className="flex-shrink-0">&larr; Flip back</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Neon Cloud Lakebase Live Telemetry Widget */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-navy-900 to-slate-950 border border-slate-800 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Database className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-white">Neon Lakebase Postgres</h4>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Connected
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Serverless compute • Branch <code className="text-saffron-300">production</code> • PgBouncer Pooler Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300">
                Region: <strong className="text-white">us-east-2 (Ohio)</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300">
                Latency: <strong className="text-emerald-400">~24ms</strong>
              </div>
            </div>
          </motion.div>

          {/* Charts & Recent Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Projects List */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Projects</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Live progress across active sprint boards</p>
                  </div>
                  <button
                    onClick={() => onNavigate('/projects')}
                    className="text-xs font-bold text-saffron-600 dark:text-amber-400 hover:text-saffron-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {projects.slice(0, 4).map((project) => (
                    <div
                      key={project.id}
                      onClick={() => onNavigate(`/projects/${project.id}`)}
                      className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-saffron-50/40 dark:hover:bg-slate-800/60 hover:border-saffron-200 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-saffron-500/10 to-amber-500/20 dark:bg-slate-800 border border-saffron-200/80 dark:border-slate-700 text-saffron-700 dark:text-amber-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          {project.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-saffron-600 dark:group-hover:text-amber-400 transition-colors">
                            {project.name}
                          </h4>
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
                            className="h-full bg-gradient-to-r from-saffron-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${project.stats?.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Task Health Donut Chart with Interactive Hover Effects */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-saffron-300 dark:hover:border-saffron-500/50 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group/chart">
              {/* Ambient Glow */}
              <div className="absolute -right-10 -top-10 w-44 h-44 bg-gradient-to-br from-saffron-500/10 via-amber-500/10 to-transparent rounded-full blur-2xl pointer-events-none group-hover/chart:scale-150 transition-transform duration-700" />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-saffron-500" />
                    Task Distribution
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    Live Telemetry
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Breakdown by current workflow status
                </p>

                {/* Donut Chart with Center Analytics Callout */}
                <div className="h-56 relative flex items-center justify-center">
                  {totalTasks === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500">No task data available yet</p>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusChartData}
                            innerRadius={56}
                            outerRadius={hoveredStatusIndex !== null ? 82 : 78}
                            paddingAngle={5}
                            dataKey="value"
                            onMouseEnter={(_, index) => setHoveredStatusIndex(index)}
                            onMouseLeave={() => setHoveredStatusIndex(null)}
                          >
                            {statusChartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                className="cursor-pointer transition-all duration-300"
                                opacity={hoveredStatusIndex === null || hoveredStatusIndex === index ? 1 : 0.45}
                                stroke={hoveredStatusIndex === index ? '#ffffff' : 'transparent'}
                                strokeWidth={hoveredStatusIndex === index ? 2 : 0}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0];
                                return (
                                  <div className="bg-slate-900/95 text-white backdrop-blur-md p-2.5 rounded-xl shadow-xl border border-slate-800 text-xs">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: data.payload.color }}
                                      />
                                      <span className="font-bold">{data.name}</span>
                                    </div>
                                    <div className="text-slate-300">
                                      Tasks: <strong className="text-white">{data.value}</strong>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Donut Hole Center Telemetry Badge */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                          {hoveredStatusIndex !== null
                            ? statusChartData[hoveredStatusIndex].value
                            : totalTasks}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
                          {hoveredStatusIndex !== null
                            ? statusChartData[hoveredStatusIndex].name.split('/')[0].trim()
                            : 'Total Tasks'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Interactive Status Pill Cards with Hover Effects */}
              <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                {statusChartData.map((item, idx) => {
                  const isHovered = hoveredStatusIndex === idx;
                  const percent = totalTasks > 0 ? Math.round((item.value / totalTasks) * 100) : 0;

                  return (
                    <div
                      key={item.name}
                      onMouseEnter={() => setHoveredStatusIndex(idx)}
                      onMouseLeave={() => setHoveredStatusIndex(null)}
                      className={`p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isHovered
                          ? 'scale-105 shadow-md bg-saffron-50/80 dark:bg-slate-800 border-saffron-300 dark:border-amber-500'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">
                          {item.name.split('/')[0].trim()}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {item.value}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {percent}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};


