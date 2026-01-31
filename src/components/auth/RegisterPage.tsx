import * as React from 'react';
import { AuthLayout } from './AuthLayout';
import RegisterForm from '../forms/RegisterForm';

export function RegisterPage() {
  const footer = (
    <p className="text-muted-foreground">
      Masz już konto?{' '}
      <a href="/login" className="text-primary hover:underline font-medium">
        Zaloguj się
      </a>
    </p>
  );

  return (
    <AuthLayout title="Rejestracja" footer={footer}>
      <RegisterForm />
    </AuthLayout>
  );
}
