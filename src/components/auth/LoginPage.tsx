import * as React from 'react';
import { AuthLayout } from './AuthLayout';
import LoginForm from '../forms/LoginForm';

interface LoginPageProps {
  redirectUrl?: string;
}

export function LoginPage({ redirectUrl }: LoginPageProps) {
  return (
    <AuthLayout
      title="Logowanie"
      subtitle="Witaj ponownie! Zaloguj się do swojego konta."
    >
      <LoginForm redirectUrl={redirectUrl} />
    </AuthLayout>
  );
}
