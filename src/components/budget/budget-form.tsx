
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
import { useForm, useFieldArray } from 'react-hook-form';
import type { Budget } from '@/lib/types';
import { useEffect } from 'react';
import { PlusCircle, XCircle } from 'lucide-react';

type BudgetFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Budget) => void;
  budget?: Budget;
};

export function BudgetForm({ isOpen, onClose, onSubmit, budget }: BudgetFormProps) {
  const { register, control, handleSubmit, reset } = useForm<Budget>({
    defaultValues: {
      name: '',
      expenses: [{ category: '', amount: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "expenses"
  });

  useEffect(() => {
    if (isOpen) {
        if (budget) {
            reset(budget);
        } else {
            reset({
                name: '',
                expenses: [{ category: '', amount: 0 }],
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
              <Input id="name" {...register('name', { required: true })} className="col-span-3" />
            </div>

            <div>
              <Label className="mb-2 block text-center">Expenses</Label>
              <div className="space-y-2">
                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Input
                      {...register(`expenses.${index}.category`, { required: true })}
                      placeholder="Category"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      {...register(`expenses.${index}.amount`, { required: true, valueAsNumber: true })}
                      placeholder="Amount"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1 mt-2"
                  onClick={() => append({ category: '', amount: 0 })}
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Expense
                </Button>
              </div>
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

