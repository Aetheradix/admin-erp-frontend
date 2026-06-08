'use client';

import React from 'react';
import Link from 'next/link';
import { useRegister } from './hooks/useRegister';
import RegisterForm from './components/RegisterForm';

export default function Register() {
  const { loading, handleRegister } = useRegister();

  return (
    <div className="auth-form-container">
      <h2 className="auth-form-title">Create your account</h2>
      <p className="auth-form-subtitle">
        Start your 14-day free trial. No credit card required.
      </p>

      <RegisterForm loading={loading} onFinish={handleRegister} />

      <div className="auth-form-footer">
        Already have an account?{' '}
        <Link href="/auth/login">Sign in</Link>
      </div>
    </div>
  );
}
