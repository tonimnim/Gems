'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOwnerCheck } from '@/hooks/useOwnerCheck';
import { ROUTES } from '@/constants';

interface AddGemButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export function AddGemButton({
  className,
  variant = 'default',
  size = 'default',
  children,
}: AddGemButtonProps) {
  const router = useRouter();
  const { checkAndRedirect } = useOwnerCheck();
  const [isChecking, setIsChecking] = useState(false);

  const handleClick = async () => {
    setIsChecking(true);
    try {
      const canProceed = await checkAndRedirect();
      if (canProceed) {
        router.push(ROUTES.newGem);
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isChecking}
      variant={variant}
      size={size}
      className={className}
    >
      {isChecking ? (
        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        <Plus className="h-4 w-4 mr-2" />
      )}
      {children || 'Add Gem'}
    </Button>
  );
}
