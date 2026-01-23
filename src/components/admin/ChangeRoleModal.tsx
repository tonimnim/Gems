'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/types';

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newRole: UserRole) => Promise<void>;
  userName: string;
  currentRole: UserRole;
}

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  { value: 'visitor', label: 'Visitor', description: 'Can browse and save gems' },
  { value: 'owner', label: 'Owner', description: 'Can create and manage their own gems' },
  { value: 'admin', label: 'Admin', description: 'Full access to admin dashboard' },
];

export function ChangeRoleModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  currentRole,
}: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (selectedRole === currentRole) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(selectedRole);
      onClose();
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'owner':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role for <span className="font-medium">{userName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current role display */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current role:</span>
            <Badge className={getRoleBadgeClass(currentRole)}>
              {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
            </Badge>
          </div>

          {/* Role selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">New role</label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Warning for admin role */}
          {selectedRole === 'admin' && currentRole !== 'admin' && (
            <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">Warning: Admin Role</p>
                <p className="text-amber-700 mt-1">
                  Admin users have full access to the admin dashboard, including
                  the ability to manage all gems, users, and payments. Only grant
                  this role to trusted team members.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || selectedRole === currentRole}
          >
            {isLoading ? 'Updating...' : 'Update Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
