import * as React from 'react';
import { HeroSection } from './HeroSection';
import { AuthCard } from './AuthCard';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Hero */}
      <HeroSection />

      {/* Right side - Auth form */}
      <AuthCard title={title} subtitle={subtitle} footer={footer}>
        {children}
      </AuthCard>
    </div>
  );
}

export { AuthCard } from './AuthCard';
export { HeroSection } from './HeroSection';
