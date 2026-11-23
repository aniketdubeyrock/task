import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';

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
      toastError(err.message || 'Login failed');
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
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center px-4 py-12 select-none relative overflow-hidden">
      {/* Saffron Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-saffron-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-saffron-500 via-amber-500 to-saffron-600 text-white font-black text-2xl shadow-saffron mb-4">
            TF
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">TaskFlow</h2>
          <p className="text-sm text-slate-400 mt-1">Manage work. Deliver better.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-saffron-lg border border-saffron-100/90 p-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Sign in to your account</h3>
            <p className="text-xs text-slate-500 mt-1">Enter your credentials to access your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-3">
              One-Click Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillCredentials('superadmin@taskflow.dev', 'SuperAdmin123!')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-saffron-300 bg-saffron-50 hover:bg-saffron-100 text-saffron-800 text-xs font-bold transition-colors shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-saffron-600 flex-shrink-0" />
                <span>Super Admin</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('jane@taskflow.dev', 'Password123!')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors shadow-2xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>Jane Dev</span>
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => onNavigate('/register')}
              className="text-saffron-600 hover:text-saffron-700 font-bold underline underline-offset-2 ml-1"
            >
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

