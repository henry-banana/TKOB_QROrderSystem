import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Card } from '@/shared/components/ui';
import { QrCode, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/lib/routes';
import { authService } from './services';
import "../../styles/globals.css";

// Validation schema
const signupSchema = z.object({
  restaurantName: z.string()
    .min(3, 'Restaurant name must be at least 3 characters')
    .max(50, 'Restaurant name must be at most 50 characters'),
  slug: z.string().default(''),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character (!@#$%^&*...)'),
  confirmPassword: z.string(),
  agreedToTerms: z.boolean().refine((val: boolean) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupProps {
  onNavigate?: (screen: string) => void;
  initialEmail?: string;
}

export function Signup({ onNavigate, initialEmail }: SignupProps) {
  const [language, setLanguage] = useState('EN');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugCheckResult, setSlugCheckResult] = useState<{ available: boolean; message?: string } | null>(null);

  const {
    register,
    handleSubmit: formHandleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: {
      email: initialEmail || '',
      agreedToTerms: false,
      slug: '',
    },
  });

  const restaurantName = watch('restaurantName');
  const slug = watch('slug');

  // Generate slug from restaurant name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Collapse multiple hyphens
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Auto-generate slug when restaurant name changes
  useEffect(() => {
    if (restaurantName && !slug) {
      const generated = generateSlug(restaurantName);
      setValue('slug', generated);
    }
  }, [restaurantName, slug, setValue]);

  // Check slug availability
  const handleCheckAvailability = async () => {
    const effectiveSlug = slug || generateSlug(restaurantName);
    if (!effectiveSlug) {
      toast.error('Please enter a restaurant name first');
      return;
    }

    setIsCheckingSlug(true);
    try {
      const result = await authService.checkSlugAvailability(effectiveSlug);
      setSlugCheckResult(result);
      
      if (result.available) {
        toast.success('✅ Slug is available');
      } else {
        toast.error(result.message || 'Slug is not available');
      }
    } catch (error) {
      console.error('[Signup] Check slug error:', error);
      toast.error('Failed to check availability');
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // Get effective slug for preview
  const getEffectiveSlug = (): string => {
    if (slug) return slug;
    if (restaurantName) return generateSlug(restaurantName);
    return '';
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      const result = await authService.signup({
        tenantName: data.restaurantName,
        slug: data.slug || generateSlug(data.restaurantName),
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      if (result.success) {
        toast.success(result.message || 'Check your email for OTP');
        
        // Navigate to email verification with email and registration token as query params
        const params = new URLSearchParams({
          email: data.email,
          ...(result.registrationToken && { token: result.registrationToken }),
        });
        onNavigate?.(`${ROUTES.emailVerification}?${params.toString()}`);
      } else {
        toast.error(result.message || 'Signup failed');
      }
    } catch (error) {
      console.error('[Signup] Signup error:', error);
      toast.error('Signup failed. Please try again.');
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

      <Card className="w-full max-w-md p-8 shadow-md">
        <div className="flex flex-col gap-8">
          {/* Logo & Title */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <QrCode className="w-10 h-10 text-white" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-gray-900">Create your account</h2>
              <p className="text-gray-600">Start managing your restaurant today</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={formHandleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Restaurant Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                Restaurant Name
              </label>
              <input
                type="text"
                placeholder="Your Restaurant Name"
                {...register('restaurantName')}
                className={`h-12 px-4 border ${
                  errors.restaurantName ? 'border-red-500' : 'border-gray-300'
                } rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors`}
              />
              {errors.restaurantName && (
                <p className="text-red-600 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.restaurantName.message}
                </p>
              )}
            </div>

            {/* Restaurant Slug Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                Restaurant Slug (optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. tkob-restaurant"
                  {...register('slug')}
                  className={`flex-1 h-12 px-4 border ${
                    errors.slug ? 'border-red-500' : 'border-gray-300'
                  } rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors`}
                  style={{ fontSize: '15px' }}
                />
                <button
                  type="button"
                  onClick={handleCheckAvailability}
                  disabled={isCheckingSlug}
                  className="px-4 py-2 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors disabled:opacity-50"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                  tabIndex={-1}
                >
                  {isCheckingSlug ? 'Checking...' : 'Check'}
                </button>
              </div>
              
              {/* Helper text */}
              <p className="text-gray-500" style={{ fontSize: '12px' }}>
                This will be used in your restaurant URL. Leave empty to auto-generate from the restaurant name.
              </p>
              
              {/* URL Preview */}
              {getEffectiveSlug() && (
                <div className="text-gray-600" style={{ fontSize: '14px' }}>
                  Preview: <span className="text-emerald-600">{getEffectiveSlug()}.tkqr.com</span>
                  {!slug && <span className="text-gray-400"> (auto)</span>}
                </div>
              )}
              
              {/* Slug check result */}
              {slugCheckResult && (
                <div className={`flex items-center gap-2 text-sm ${slugCheckResult.available ? 'text-green-600' : 'text-red-600'}`}>
                  {slugCheckResult.available ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {slugCheckResult.message}
                </div>
              )}
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Nguyen Van A"
                {...register('fullName')}
                className={`h-12 px-4 border ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                } rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors`}
              />
              {errors.fullName && (
                <p className="text-red-600 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                Email
              </label>
              <input
                type="email"
                placeholder="admin@restaurant.com"
                {...register('email')}
                className={`h-12 px-4 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors`}
              />
              {errors.email && (
                <p className="text-red-600 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email.message}
                </p>
              )}
            </div>
            
            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Create a strong password"
                {...register('password')}
                className={`h-12 px-4 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors`}
              />
              {errors.password ? (
                <p className="text-red-600 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password.message}
                </p>
              ) : (
                <p className="text-gray-500 text-xs">
                  Must be at least 8 characters with a number (0-9) and special character (!@#$%^&*...)
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                {...register('confirmPassword')}
                className={`h-12 px-4 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors`}
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms Agreement */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('agreedToTerms')}
                className="w-4 h-4 mt-1 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                tabIndex={-1}
              />
              <span className="text-gray-600" style={{ fontSize: '14px' }}>
                I agree to the{' '}
                <button type="button" tabIndex={-1} className="text-emerald-500 hover:text-emerald-600 transition-colors" style={{ fontWeight: 500 }}>
                  Terms and Conditions
                </button>
              </span>
            </label>
            {errors.agreedToTerms && (
              <p className="text-red-600 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.agreedToTerms.message}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-4 pt-2">
              <Button type="submit" disabled={isSubmitting} className="w-full focus:ring-black focus:ring-2">
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
              
              <div className="text-center">
                <span className="text-gray-600" style={{ fontSize: '14px' }}>
                  Already have an account?{' '}
                </span>
                <button 
                  type="button"
                  onClick={() => onNavigate?.(ROUTES.login)}
                  className="text-emerald-500 hover:text-emerald-600 transition-colors" 
                  style={{ fontSize: '14px', fontWeight: 500 }}
                  tabIndex={-1}
                >
                  Log in
                </button>
              </div>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

export default Signup;
