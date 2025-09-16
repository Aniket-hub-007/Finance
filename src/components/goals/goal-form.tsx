
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
import type { SavingsGoal } from '@/lib/types';
import { useEffect } from 'react';

type GoalFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<SavingsGoal, 'id' | '_id'>) => void;
  goal?: SavingsGoal;
};

export function GoalForm({ isOpen, onClose, onSubmit, goal }: GoalFormProps) {
  const { register, handleSubmit, reset } = useForm<Omit<SavingsGoal, 'id' | '_id'>>();

   useEffect(() => {
    if (isOpen) {
        if (goal) {
            const { id, _id, ...defaultValues } = goal;
            reset(defaultValues);
        } else {
            reset({
                name: '',
                currentAmount: 0,
                targetAmount: 1000,
                deadline: undefined,
            });
        }
    }
  }, [goal, reset, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Savings Goal' : 'Add Savings Goal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" {...register('name', { required: true })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentAmount" className="text-right">Current Amount</Label>
              <Input id="currentAmount" type="number" {...register('currentAmount', { required: true, valueAsNumber: true })} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="targetAmount" className="text-right">Target Amount</Label>
              <Input id="targetAmount" type="number" {...register('targetAmount', { required: true, valueAsNumber: true })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deadline" className="text-right">Deadline</Label>
              <Input id="deadline" type="date" {...register('deadline')} className="col-span-3" />
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
