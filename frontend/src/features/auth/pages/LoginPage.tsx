import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { ThemeToggle } from '../../../components/layout/ThemeToggle';
import {
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Kanban,
  Zap,
  Lock,
  Flame,
  Layers,
} from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please enter a valid email address';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      toastSuccess('Signed in successfully! Welcome back.');
      onNavigate('/dashboard');
    } catch (err: any) {
      toastError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrors({});
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FAF9F6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 overflow-x-hidden">
      {/* LEFT COLUMN: Visual Brand Showcase (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-gradient-to-br from-navy-950 via-slate-900 to-navy-900 text-white flex-col justify-between p-12 relative overflow-hidden border-r border-slate-800">
        {/* Ambient Saffron Glow Circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-saffron-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-saffron-500 via-amber-500 to-saffron-600 flex items-center justify-center text-white font-black text-xl shadow-saffron">
            TF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white">TaskFlow</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-saffron-500/20 text-saffron-400 rounded-md border border-saffron-500/30">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400">Team Task Management Platform</p>
          </div>
        </div>

        {/* Hero Copy & Value Props */}
        <div className="relative z-10 my-auto py-12 flex flex-col gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-saffron-300 text-xs font-semibold mb-4 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-saffron-400" />
              <span>Modern Workspaces for Agile Teams</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Manage sprints, track deliverables, and ship faster.
            </h1>
            <p className="text-sm text-slate-300 mt-3 max-w-md leading-relaxed">
              Real-time Kanban boards, dynamic collaborator assignment, automated deadline notifications, and end-to-end task audit history.
            </p>
          </div>

          {/* Feature Highlights Grid with rich hover interactions */}
          <div className="flex flex-col gap-3.5 max-w-md">
            <motion.div
              whileHover={{ x: 6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md hover:border-saffron-500/60 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-saffron-500/10 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-saffron-500/20 border border-saffron-500/30 flex items-center justify-center text-saffron-400 shrink-0 group-hover:scale-110 group-hover:bg-saffron-500 group-hover:text-white transition-all shadow-sm">
                <Kanban className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-saffron-300 transition-colors">
                  Interactive Kanban Flow
                </h4>
                <p className="text-[11px] text-slate-400">Optimistic drag-and-drop reordering with live status sync.</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ x: 6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md hover:border-amber-500/60 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                  SLA & Overdue Protection
                </h4>
                <p className="text-[11px] text-slate-400">Visual deadline indicators and automatic notification routing.</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ x: 6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md hover:border-emerald-500/60 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Cloud-Native Reliability
                </h4>
                <p className="text-[11px] text-slate-400">Powered by Neon Lakebase Postgres & Spring Boot 3 API.</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>99.9% Cloud Uptime</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-saffron-400" />
            <span>JWT & BCrypt Encrypted</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Form Area */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative overflow-y-auto">
        {/* Top Header Toolbar with Theme Toggle */}
        <div className="w-full flex items-center justify-between max-w-md mx-auto">
          {/* Mobile Brand (Only shown on small screens) */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-saffron-500 via-amber-500 to-saffron-600 flex items-center justify-center text-white font-black text-sm shadow-saffron">
              TF
            </div>
            <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">TaskFlow</span>
          </div>

          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Center Form Card with 3D lift & hover dynamics */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mx-auto my-auto py-8"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-9 shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-amber-200/70 dark:border-slate-800 hover:border-saffron-400/80 dark:hover:border-saffron-500/50 hover:shadow-2xl hover:shadow-saffron-500/10 transition-all duration-300">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-saffron-50 dark:bg-slate-800 border border-saffron-200/80 dark:border-slate-700 text-saffron-700 dark:text-amber-400 text-[11px] font-bold mb-3">
                <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                <span>Secure Authentication</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Welcome back
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Enter your credentials to access your workspace
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="group transition-all">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  disabled={isLoading}
                  className="transition-all duration-200 focus:scale-[1.01] hover:border-saffron-300 dark:hover:border-saffron-500"
                />
              </div>

              <div className="group transition-all">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  disabled={isLoading}
                  className="transition-all duration-200 focus:scale-[1.01] hover:border-saffron-300 dark:hover:border-saffron-500"
                />
              </div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2 py-3 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-200"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                >
                  Sign In to Workspace
                </Button>
              </motion.div>
            </form>

            {/* Quick One-Click Demo Accounts with interactive hover lift & glow */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Demo Access
                </span>
                <span className="text-[10px] text-saffron-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-saffron-500" />
                  1-Click Fill
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => fillCredentials('superadmin@taskflow.dev', 'SuperAdmin123!')}
                  className="flex items-center gap-2 p-3 rounded-2xl border border-amber-200 dark:border-slate-700 bg-amber-50/70 dark:bg-slate-800/80 hover:bg-amber-100/90 dark:hover:bg-slate-800 hover:border-saffron-400 hover:shadow-md hover:shadow-saffron-500/15 transition-all text-left group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate group-hover:text-saffron-600 dark:group-hover:text-amber-400 transition-colors">
                      Super Admin
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                      Full access
                    </span>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => fillCredentials('jane@taskflow.dev', 'Password123!')}
                  className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-saffron-400 hover:shadow-md hover:shadow-slate-500/10 transition-all text-left group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-800 dark:bg-slate-700 text-amber-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-transform">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate group-hover:text-saffron-600 dark:group-hover:text-amber-400 transition-colors">
                      Jane Dev
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                      Collaborator
                    </span>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Register Link */}
            <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => onNavigate('/register')}
                className="text-saffron-600 dark:text-amber-400 hover:text-saffron-700 font-bold underline underline-offset-2 ml-1 cursor-pointer"
              >
                Create an account
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bottom copyright */}
        <div className="w-full text-center text-xs text-slate-400 py-2">
          &copy; {new Date().getFullYear()} TaskFlow Enterprise &bull; Secure Cloud Platform
        </div>
      </div>
    </div>
  );
};


