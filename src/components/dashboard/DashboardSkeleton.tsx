import * as React from 'react';
import { SpectrumSkeleton } from '../spectrum/spectrum-skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Overview Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl p-4 bg-card border">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <SpectrumSkeleton height="16px" width="60%" animation="wave" />
                <SpectrumSkeleton height="32px" width="40%" animation="wave" />
                <SpectrumSkeleton height="12px" width="80%" animation="wave" />
              </div>
              <SpectrumSkeleton
                variant="rectangular"
                width="40px"
                height="40px"
                className="rounded-lg"
                animation="wave"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Header Skeleton */}
      <div className="space-y-4">
        <SpectrumSkeleton height="36px" width="200px" animation="wave" />
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <SpectrumSkeleton height="40px" width="300px" className="rounded-md" animation="wave" />
          <div className="flex gap-2">
            <SpectrumSkeleton height="36px" width="100px" className="rounded-md" animation="wave" />
            <SpectrumSkeleton height="36px" width="120px" className="rounded-md" animation="wave" />
          </div>
        </div>
      </div>

      {/* Deck Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-lg border bg-card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <SpectrumSkeleton height="24px" width="70%" animation="wave" />
              <SpectrumSkeleton
                variant="circular"
                width="32px"
                height="32px"
                animation="wave"
              />
            </div>
            <div className="flex items-center gap-2">
              <SpectrumSkeleton height="16px" width="60px" animation="wave" />
              <SpectrumSkeleton height="20px" width="80px" className="rounded-full" animation="wave" />
            </div>
            <div className="flex gap-2 pt-2">
              <SpectrumSkeleton height="32px" width="50%" className="rounded-md" animation="wave" />
              <SpectrumSkeleton height="32px" width="50%" className="rounded-md" animation="wave" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
