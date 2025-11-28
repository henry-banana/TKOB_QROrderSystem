import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import { QrCode, AlertTriangle, CheckCircle } from 'lucide-react';

interface ResetPasswordProps {
  onNavigate?: (path: string) => void;
  token?: string | null;
  email?: string | null;
}

export function ResetPassword({ onNavigate, token, email }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [language, setLanguage] = useState('EN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Determine if token is valid (in real app, this would be validated by API)
  const isTokenValid = !!token;

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    // Simple password strength calculation
    let strength = 0;
    if (value.length >= 8) strength++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
    if (/\d/.test(value)) strength++;
    if (/[^a-zA-Z0-9]/.test(value)) strength++;
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-amber-500';
    if (passwordStrength === 3) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  const isFormValid = password && confirmPassword && password === confirmPassword && passwordStrength >= 2;

  const handleResetPassword = async () => {
    if (!isFormValid || !token) return;

    setIsSubmitting(true);
    try {
      // TODO: Call the reset-password API
      // await authService.resetPassword({ token, password });
      console.log('Resetting password with token:', token);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);

      // Redirect to login after success
      setTimeout(() => {
        onNavigate?.('/login');
      }, 2000);
    } catch (error) {
      console.error('Failed to reset password:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Invalid/Expired link state
  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        {/* Language selector */}
        <div className="absolute top-8 right-8">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 cursor-pointer focus:outline-none focus:border-emerald-500"
          >
            <option>EN</option>
            <option>VI</option>
          </select>
        </div>

        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-8">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            <div className="flex flex-col items-center gap-3 text-center">
              <h2 className="text-gray-900">Invalid or expired link</h2>
              <p className="text-gray-600">
                This password reset link is invalid or has expired. Password reset links are only valid for 1 hour.
              </p>
              <p className="text-gray-600" style={{ fontSize: '14px' }}>
                Please request a new password reset link.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Button onClick={() => onNavigate?.('/forgot-password')} className="w-full">
                Request new link
              </Button>
              <div className="text-center">
                <button 
                  onClick={() => onNavigate?.('/login')}
                  className="text-emerald-500 hover:text-emerald-600 transition-colors" 
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  Back to login
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-8">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>

            <div className="flex flex-col items-center gap-3 text-center">
              <h2 className="text-gray-900">Password reset successful!</h2>
              <p className="text-gray-600">
                Your password has been updated. Redirecting to login...
              </p>
            </div>

            <Button onClick={() => onNavigate?.('/login')} className="w-full">
              Go to login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Valid link state - reset password form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      {/* Language selector */}
      <div className="absolute top-8 right-8">
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 cursor-pointer focus:outline-none focus:border-emerald-500"
        >
          <option>EN</option>
          <option>VI</option>
        </select>
      </div>

      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col gap-8">
          {/* Logo & Title */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <QrCode className="w-10 h-10 text-white" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-gray-900">Reset your password</h2>
              <p className="text-gray-600 text-center">
                Create a new password for your account.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            {/* Read-only email */}
            {email && (
              <div className="flex flex-col gap-2">
                <label className="text-gray-900">Email</label>
                <div className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span style={{ fontSize: '14px' }}>{email}</span>
                </div>
              </div>
            )}

            {/* New password */}
            <div className="flex flex-col gap-2">
              <Input
                label="New Password"
                type="password"
                placeholder="Enter a strong password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                disabled={isSubmitting}
              />
              {password && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          level <= passwordStrength ? getStrengthColor() : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600" style={{ fontSize: '13px' }}>
                    Password strength: <span style={{ fontWeight: 500 }}>{getStrengthText()}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
              disabled={isSubmitting}
            />

            {/* Password requirements */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-blue-900 mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
                Password requirements:
              </p>
              <ul className="ml-4 text-blue-800 space-y-1" style={{ fontSize: '13px' }}>
                <li className="list-disc">At least 8 characters</li>
                <li className="list-disc">Mix of uppercase and lowercase letters</li>
                <li className="list-disc">Include numbers and symbols</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleResetPassword} 
              className="w-full"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? 'Resetting...' : 'Reset password'}
            </Button>
            
            <div className="text-center">
              <button 
                onClick={() => onNavigate?.('/login')}
                className="text-emerald-500 hover:text-emerald-600 transition-colors" 
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ResetPassword;
