import * as React from 'react';
import { SpectrumSkeleton } from '../spectrum/spectrum-skeleton';

export function StudySkeleton() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <SpectrumSkeleton height="16px" width="100px" animation="wave" />
        <SpectrumSkeleton height="16px" width="16px" animation="wave" />
        <SpectrumSkeleton height="16px" width="150px" animation="wave" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <SpectrumSkeleton height="32px" width="250px" animation="wave" />
          <SpectrumSkeleton height="16px" width="100px" animation="wave" />
        </div>
        <div className="flex items-center gap-2">
          <SpectrumSkeleton height="36px" width="120px" className="rounded-md" animation="wave" />
          <SpectrumSkeleton height="36px" width="40px" className="rounded-md" animation="wave" />
        </div>
      </div>

      {/* Flashcard Skeleton */}
      <div className="flex flex-col items-center gap-6">
        <div className="w-full max-w-2xl aspect-[3/2] rounded-xl border bg-card p-8">
          <div className="h-full flex flex-col justify-center items-center space-y-4">
            <SpectrumSkeleton height="28px" width="80%" animation="wave" />
            <SpectrumSkeleton height="20px" width="60%" animation="wave" />
            <SpectrumSkeleton height="20px" width="70%" animation="wave" />
          </div>
        </div>

        {/* Button Skeleton */}
        <SpectrumSkeleton height="44px" width="180px" className="rounded-md" animation="wave" />

        {/* Navigation Controls Skeleton */}
        <div className="flex items-center gap-4">
          <SpectrumSkeleton height="40px" width="40px" className="rounded-md" animation="wave" />
          <SpectrumSkeleton height="20px" width="60px" animation="wave" />
          <SpectrumSkeleton height="40px" width="40px" className="rounded-md" animation="wave" />
        </div>
      </div>
    </div>
  );
}
