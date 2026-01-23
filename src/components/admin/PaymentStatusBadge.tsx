'use client';

import { CheckCircle2, Clock, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentStatus } from '@/types';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const statusConfig: Record<
  PaymentStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  refunded: {
    label: 'Refunded',
    icon: RotateCcw,
    className: 'bg-gray-50 text-gray-700 border-gray-200',
  },
};

export function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

// Icon-only version for compact displays
export function PaymentStatusIcon({
  status,
  className,
}: PaymentStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  const iconColors: Record<PaymentStatus, string> = {
    completed: 'text-emerald-500',
    pending: 'text-amber-500',
    failed: 'text-red-500',
    refunded: 'text-gray-500',
  };

  return <Icon className={cn('h-4 w-4', iconColors[status], className)} />;
}
