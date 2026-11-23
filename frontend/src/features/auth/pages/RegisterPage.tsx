import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { ThemeToggle } from '../../../components/layout/ThemeToggle';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Kanban,
  Zap,
  Lock,
} from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const validate = () => {
    const errs: { name?: string; email?: string; password?: string } = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please enter a valid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register(name, email, password);
      toastSuccess('Account created! Welcome to TaskFlow.');
      onNavigate('/dashboard');
    } catch (err: any) {
      toastError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FAF9F6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 overflow-x-hidden">
      {/* LEFT COLUMN: Visual Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-gradient-to-br from-navy-950 via-slate-900 to-navy-900 text-white flex-col justify-between p-12 relative overflow-hidden border-r border-slate-800">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-saffron-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

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

        <div className="relative z-10 my-auto py-12 flex flex-col gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-saffron-300 text-xs font-semibold mb-4 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-saffron-400" />
              <span>Get Started in Under 60 Seconds</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Create your account and start building together.
            </h1>
            <p className="text-sm text-slate-300 mt-3 max-w-md leading-relaxed">
              Join your workspace to organize sprints, assign collaborators, track deliverables, and receive timely email updates.
            </p>
          </div>

          <div className="flex flex-col gap-3 max-w-md">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-saffron-500/20 border border-saffron-500/30 flex items-center justify-center text-saffron-400 shrink-0">
                <Kanban className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Unlimited Workspaces</h4>
                <p className="text-[11px] text-slate-400">Create multiple projects and track team capacity.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Automated Notifications</h4>
                <p className="text-[11px] text-slate-400">Receive in-app alerts whenever tasks are assigned to you.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Enterprise Security</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-saffron-400" />
            <span>Stateless JWT Auth</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Register Form Area */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative overflow-y-auto">
        <div className="w-full flex items-center justify-between max-w-md mx-auto">
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

        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-9 shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-amber-200/70 dark:border-slate-800 transition-all">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Create an account
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Fill out your details to get started with TaskFlow
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="Alex Carter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                disabled={isLoading}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                disabled={isLoading}
              />

              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                disabled={isLoading}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2 py-3 shadow-lg shadow-orange-500/25"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('/login')}
                className="text-saffron-600 dark:text-amber-400 hover:text-saffron-700 font-bold underline underline-offset-2 ml-1"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>

        <div className="w-full text-center text-xs text-slate-400 py-2">
          &copy; {new Date().getFullYear()} TaskFlow Enterprise &bull; Secure Cloud Platform
        </div>
      </div>
    </div>
  );
};


