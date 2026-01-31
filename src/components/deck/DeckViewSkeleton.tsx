import * as React from 'react';
import { SpectrumSkeleton } from '../spectrum/spectrum-skeleton';

export function DeckViewSkeleton() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <SpectrumSkeleton height="16px" width="80px" animation="wave" />
        <SpectrumSkeleton height="16px" width="16px" animation="wave" />
        <SpectrumSkeleton height="16px" width="120px" animation="wave" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <SpectrumSkeleton height="36px" width="300px" animation="wave" />
          <SpectrumSkeleton height="16px" width="150px" animation="wave" />
        </div>
        <div className="flex items-center gap-2">
          <SpectrumSkeleton height="36px" width="100px" className="rounded-md" animation="wave" />
          <SpectrumSkeleton height="36px" width="100px" className="rounded-md" animation="wave" />
          <SpectrumSkeleton height="36px" width="40px" className="rounded-md" animation="wave" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SpectrumSkeleton height="40px" width="250px" className="rounded-md" animation="wave" />
        <SpectrumSkeleton height="40px" width="150px" className="rounded-md" animation="wave" />
      </div>

      {/* Flashcard List Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <SpectrumSkeleton height="20px" width="90%" animation="wave" />
                <SpectrumSkeleton height="16px" width="60%" animation="wave" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <SpectrumSkeleton height="24px" width="70px" className="rounded-full" animation="wave" />
                <SpectrumSkeleton height="32px" width="32px" className="rounded-md" animation="wave" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
