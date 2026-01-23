'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const REJECTION_REASONS = [
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'duplicate_listing', label: 'Duplicate listing' },
  { value: 'insufficient_information', label: 'Insufficient information' },
  { value: 'poor_quality_images', label: 'Poor quality images' },
  { value: 'incorrect_category', label: 'Incorrect category' },
  { value: 'other', label: 'Other' },
] as const;

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (reason: string, notes: string) => Promise<void>;
  gemName: string;
  isLoading?: boolean;
}

export function RejectModal({
  isOpen,
  onClose,
  onReject,
  gemName,
  isLoading = false,
}: RejectModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [notes, setNotes] = useState('');

  const handleReject = async () => {
    if (!selectedReason) return;
    const reasonLabel = REJECTION_REASONS.find(r => r.value === selectedReason)?.label || selectedReason;
    await onReject(reasonLabel, notes);
    setSelectedReason('');
    setNotes('');
  };

  const handleClose = () => {
    setSelectedReason('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Gem</DialogTitle>
          <DialogDescription>
            Please select a reason for rejecting &quot;{gemName}&quot;. This will be shared with the owner.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <RadioGroup
            value={selectedReason}
            onValueChange={setSelectedReason}
            className="gap-3"
          >
            {REJECTION_REASONS.map((reason) => (
              <div key={reason.value} className="flex items-center space-x-3">
                <RadioGroupItem value={reason.value} id={reason.value} />
                <Label
                  htmlFor={reason.value}
                  className="text-sm font-normal cursor-pointer"
                >
                  {reason.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="pt-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Additional notes (optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide more details about the rejection..."
              className="mt-2 min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleReject}
            disabled={!selectedReason || isLoading}
          >
            {isLoading ? 'Rejecting...' : 'Reject Gem'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
