
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
import type { Budget } from '@/lib/types';
import { useEffect } from 'react';

type BudgetFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Budget, 'id' | '_id'>) => void;
  budget?: Budget;
};

export function BudgetForm({ isOpen, onClose, onSubmit, budget }: BudgetFormProps) {
  const { register, handleSubmit, reset } = useForm<Omit<Budget, 'id' | '_id'>>({
    defaultValues: {
      name: '',
      amount: 0,
    }
  });

  useEffect(() => {
    if (isOpen) {
        if (budget) {
            const { id, _id, ...defaultValues } = budget;
            reset(defaultValues);
        } else {
            reset({
                name: '',
                amount: 0,
            });
        }
    }
  }, [budget, reset, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{budget ? 'Edit Budget' : 'Add Budget'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" {...register('name', { required: true })} className="col-span-3" placeholder="e.g., Groceries" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Budget Amount</Label>
              <Input id="amount" type="number" {...register('amount', { required: true, valueAsNumber: true })} className="col-span-3" />
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
