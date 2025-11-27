"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Signup from '@/features/auth/Signup';

export default function SignupPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600">TKOB Admin</h1>
          <p className="mt-2 text-sm text-gray-600">Restaurant Management Portal</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
          {/* Render feature Signup and delegate navigation to router */}
          <Signup onNavigate={(path) => router.push(path)} />
        </div>
      </div>
    </main>
  );
}
