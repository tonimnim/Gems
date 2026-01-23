'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function GemCardSkeleton() {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Image Skeleton */}
          <Skeleton className="w-full md:w-32 h-40 md:h-24 rounded-lg flex-shrink-0" />

          {/* Content Skeleton */}
          <div className="flex-1 space-y-3">
            {/* Title and badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>

            {/* Location */}
            <Skeleton className="h-4 w-32" />

            {/* Owner info */}
            <div className="flex gap-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-36" />
            </div>

            {/* Time */}
            <Skeleton className="h-4 w-24" />

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Meta */}
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function VerificationSkeleton() {
  return (
    <>
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      {/* Tabs Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-10 w-full max-w-md rounded-lg" />
      </div>

      {/* Cards Skeleton */}
      <div className="space-y-4">
        <GemCardSkeleton />
        <GemCardSkeleton />
        <GemCardSkeleton />
      </div>
    </>
  );
}
