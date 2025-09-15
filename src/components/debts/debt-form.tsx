
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import type { Debt } from '@/lib/types';
import { useEffect } from 'react';

type DebtFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Debt) => void;
  debt?: Debt;
};

export function DebtForm({ isOpen, onClose, onSubmit, debt }: DebtFormProps) {
  const { register, handleSubmit, reset } = useForm<Debt>();

   useEffect(() => {
    if (debt) {
      reset(debt);
    } else {
      reset({
        name: '',
        initialAmount: 0,
        currentBalance: 0,
        interestRate: 0,
      });
    }
  }, [debt, reset, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{debt ? 'Edit Debt' : 'Add Debt'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" {...register('name', { required: true })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="initialAmount" className="text-right">Initial Amount</Label>
              <Input id="initialAmount" type="number" {...register('initialAmount', { required: true, valueAsNumber: true })} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentBalance" className="text-right">Current Balance</Label>
              <Input id="currentBalance" type="number" {...register('currentBalance', { required: true, valueAsNumber: true })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interestRate" className="text-right">Interest Rate (%)</Label>
              <Input id="interestRate" type="number" step="0.01" {...register('interestRate', { required: true, valueAsNumber: true })} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
