'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle, X, Check } from 'lucide-react';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

   useEffect(() => {
      const token = localStorage.getItem("token");
      setLoading(true);
  
      if (!token) {
        router.replace("/login");
        return;
      }
  
      // ✅ token exists → allow page
      setLoading(false);
    }, []);

  // Password strength validation
  const validatePasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    return checks;
  };

  const passwordStrength = validatePasswordStrength(formData.newPassword);
  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;

  const getStrengthColor = () => {
    if (strengthScore <= 2) return 'bg-red-500';
    if (strengthScore === 3) return 'bg-yellow-500';
    if (strengthScore === 4) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (strengthScore <= 2) return 'Weak';
    if (strengthScore === 3) return 'Fair';
    if (strengthScore === 4) return 'Good';
    return 'Strong';
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.currentPassword) {
      setError('Current password is required');
      return;
    }

    if (!formData.newPassword) {
      setError('New password is required');
      return;
    }

    if (strengthScore < 4) {
      setError('Password does not meet strength requirements');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      // Replace with your actual API endpoint
      const res = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/main');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Change Password
          </h1>
          <p className="text-gray-600">Secure your account with a strong password</p>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Password Updated!</p>
                <p className="text-sm text-green-600 mt-1">Redirecting to dashboard...</p>
              </div>
            </div>
          )}

          {/* Change Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password Field */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password Field */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getStrengthColor()} transition-all duration-300`}
                        style={{ width: `${(strengthScore / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {getStrengthLabel()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Password Requirements */}
            {formData.newPassword && (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Password Requirements:
                </p>
                <div className="space-y-2">
                  <RequirementItem met={passwordStrength.length} text="At least 8 characters" />
                  <RequirementItem met={passwordStrength.uppercase} text="One uppercase letter" />
                  <RequirementItem met={passwordStrength.lowercase} text="One lowercase letter" />
                  <RequirementItem met={passwordStrength.number} text="One number" />
                  <RequirementItem met={passwordStrength.special} text="One special character" />
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-orange-600 focus:ring-4 focus:ring-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating Password...
                </span>
              ) : success ? (
                'Password Updated!'
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>

        {/* Back to Dashboard Link */}
        <p className="text-center mt-6 text-sm text-gray-600">
          <a
            href="/main"
            className="font-medium text-orange-600 hover:text-orange-700 transition-colors"
          >
            ← Back to Dashboard
          </a>
        </p>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>Internal Analytics Tool · Wafer EDX Defect Intelligence</p>
          <p className="mt-1">© 2026 All rights reserved</p>
        </div>
      </div>
    </div>
  );
}

// Helper component for requirement items
function RequirementItem({ met, text }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-600' : 'text-gray-500'}`}>
      {met ? (
        <Check className="w-4 h-4 flex-shrink-0" />
      ) : (
        <X className="w-4 h-4 flex-shrink-0" />
      )}
      <span>{text}</span>
    </div>
  );
}
