import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import { QrCode } from 'lucide-react';

interface ForgotPasswordProps {
  onNavigate?: (path: string) => void;
}

export function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('EN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSendLink = async () => {
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      // TODO: Call the forgot-password API
      // await authService.forgotPassword(email);
      console.log('Sending reset link to:', email);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to send reset link:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <h2 className="text-gray-900">Forgot password?</h2>
              <p className="text-gray-600 text-center">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="admin@restaurant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitted}
            />

            <div className={`p-4 rounded-xl border ${isSubmitted ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
              <p className={isSubmitted ? 'text-green-900' : 'text-blue-900'} style={{ fontSize: '13px' }}>
                {isSubmitted 
                  ? 'If your email exists in our system, you will receive an email with instructions shortly.'
                  : 'If your email exists in our system, you will receive an email with instructions.'
                }
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleSendLink} 
              className="w-full"
              disabled={!email || isSubmitting || isSubmitted}
            >
              {isSubmitting ? 'Sending...' : isSubmitted ? 'Email sent!' : 'Send reset link'}
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

          {/* Dev mode - test reset password page */}
          {isSubmitted && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-500 text-center mb-2" style={{ fontSize: '12px' }}>
                Dev mode (remove in production)
              </p>
              <button
                onClick={() => onNavigate?.(`/forgot-password/reset?token=demo-token-123&email=${encodeURIComponent(email)}`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-emerald-500 transition-all text-center"
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                Open Reset Password Page (Demo)
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default ForgotPassword;
