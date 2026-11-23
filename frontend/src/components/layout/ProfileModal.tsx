import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../ui/Toast';
import {
  User as UserIcon,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser, isSuperAdmin } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sync state if user changes
  React.useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Name cannot be empty');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const res = await api.put('/auth/profile', { name: name.trim() });
      if (res.data?.success && res.data.data) {
        updateUser(res.data.data);
        toastSuccess('Profile updated successfully!');
        onClose();
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toastError('Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      toastError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('New passwords do not match');
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data?.success) {
        toastSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'Empty', color: 'bg-slate-200 dark:bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, text: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 50, text: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, text: 'Good', color: 'bg-blue-500' };
    return { score: 100, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Account Settings"
      description="Manage your personal details, credentials, and workspace security"
      maxWidth="md"
    >
      <div className="flex flex-col gap-5">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-900 text-saffron-700 dark:text-amber-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            Profile Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'security'
                ? 'bg-white dark:bg-slate-900 text-saffron-700 dark:text-amber-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Change Password
          </button>
        </div>

        {/* Tab 1: Profile Details */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
            {/* User Hero Preview */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-tr from-saffron-50/70 via-amber-50/30 to-white dark:from-slate-850 dark:to-slate-900 border border-saffron-200/70 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-saffron-500 to-amber-500 p-[2px] shadow-sm flex-shrink-0">
                <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center text-saffron-700 dark:text-amber-400 font-extrabold text-lg">
                  {initials}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                    {user.name}
                  </h4>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                      isSuperAdmin
                        ? 'bg-saffron-500/15 text-saffron-700 dark:text-amber-400 border-saffron-300 dark:border-amber-500/40'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{user.email}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Active Session
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-saffron-500" /> Neon DB Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Display Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full"
              />
            </div>

            {/* Read-Only Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] font-medium text-slate-400">(Managed by Workspace)</span>
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed pl-9"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isUpdatingProfile}
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Ensure your account uses a strong password with at least 6 characters including letters, numbers, and symbols.
              </p>
            </div>

            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <Input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400">Strength:</span>
                    <span className="text-slate-700 dark:text-slate-300">{strength.text}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${strength.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${strength.score}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isChangingPassword}
                leftIcon={<KeyRound className="w-3.5 h-3.5" />}
              >
                Update Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
