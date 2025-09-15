
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

type BalanceFormData = {
  bank: number;
  upi: number;
  cash: number;
};

type BalanceEditFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BalanceFormData) => void;
  currentBalances: BalanceFormData;
};

export function BalanceEditForm({ isOpen, onClose, onSubmit, currentBalances }: BalanceEditFormProps) {
  const { register, handleSubmit, reset } = useForm<BalanceFormData>();

  useEffect(() => {
    if (isOpen) {
      reset(currentBalances);
    }
  }, [currentBalances, reset, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Balances</DialogTitle>
          <DialogDescription>Update your current account balances.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bank" className="text-right">Bank Balance</Label>
              <Input id="bank" type="number" step="0.01" {...register('bank', { required: true, valueAsNumber: true })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="upi" className="text-right">UPI Balance</Label>
              <Input id="upi" type="number" step="0.01" {...register('upi', { required: true, valueAsNumber: true })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cash" className="text-right">Cash on Hand</Label>
              <Input id="cash" type="number" step="0.01" {...register('cash', { required: true, valueAsNumber: true })} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
