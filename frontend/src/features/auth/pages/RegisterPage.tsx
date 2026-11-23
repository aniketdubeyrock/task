import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { ArrowRight } from 'lucide-react';

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
      toastSuccess('Account created! Welcome to TaskFlow. We sent a welcome email to your inbox.');
      onNavigate('/dashboard');
    } catch (err: any) {
      toastError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center px-4 py-12 select-none relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-saffron-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-saffron-500 via-amber-500 to-saffron-600 text-white font-black text-2xl shadow-saffron mb-4">
            TF
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">TaskFlow</h2>
          <p className="text-sm text-slate-400 mt-1">Start collaborating with your team today.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-saffron-lg border border-saffron-100/90 p-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Create an account</h3>
            <p className="text-xs text-slate-500 mt-1">Fill out your details to get started</p>
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
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('/login')}
              className="text-saffron-600 hover:text-saffron-700 font-bold underline underline-offset-2 ml-1"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

