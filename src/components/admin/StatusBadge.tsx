'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type Status = 'approved' | 'pending' | 'rejected' | 'expired';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<
  Status,
  { label: string; dotColor: string; bgColor: string; textColor: string }
> = {
  approved: {
    label: 'Approved',
    dotColor: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
  },
  pending: {
    label: 'Pending',
    dotColor: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
  },
  rejected: {
    label: 'Rejected',
    dotColor: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
  },
  expired: {
    label: 'Expired',
    dotColor: 'bg-gray-400',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        'border-0 font-medium',
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <span
        className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', config.dotColor)}
      />
      {config.label}
    </Badge>
  );
}

export default StatusBadge;
