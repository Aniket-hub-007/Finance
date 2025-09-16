
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { Transaction } from '@/lib/types';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { useAppContext } from '@/context/app-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function TransactionsPage() {
    const { transactions, addTransaction, updateTransaction, deleteTransaction, isLoading } = useAppContext();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPaymentMode, setSelectedPaymentMode] = useState('all');

    const expenseCategories = useMemo(() => {
        const categories = new Set(transactions.filter(t => t.type === 'expense').map(t => t.category));
        return ['all', ...Array.from(categories)];
    }, [transactions]);
    
    const paymentMethods = useMemo(() => {
        const methods = new Set(transactions.map(t => t.paymentMethod));
        return ['all', ...Array.from(methods)];
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const categoryMatch = selectedCategory === 'all' || t.category === selectedCategory;
            const paymentModeMatch = selectedPaymentMode === 'all' || t.paymentMethod === selectedPaymentMode;
            return categoryMatch && paymentModeMatch;
        });
    }, [transactions, selectedCategory, selectedPaymentMode]);

    const handleAdd = () => {
        setSelectedTransaction(undefined);
        setIsFormOpen(true);
    }

    const handleEdit = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsFormOpen(true);
    }

    const handleDelete = async (id: string | number) => {
        const transactionToDelete = transactions.find(t => t.id === id);
        if (transactionToDelete) {
            await deleteTransaction(transactionToDelete);
        }
    }

    const handleFormSubmit = async (transaction: Omit<Transaction, 'id' | '_id'>) => {
        if(selectedTransaction) {
            await updateTransaction({ ...transaction, id: selectedTransaction.id, _id: selectedTransaction._id });
        } else {
            await addTransaction(transaction);
        }
        setIsFormOpen(false);
    }


  return (
    <>
    <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter transactions by category and payment method.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category-filter">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payment-mode-filter">Payment Mode</Label>
                <Select value={selectedPaymentMode} onValueChange={setSelectedPaymentMode}>
                  <SelectTrigger id="payment-mode-filter">
                    <SelectValue placeholder="Select a payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                     {paymentMethods.map(method => (
                      <SelectItem key={method} value={method} className="capitalize">{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
        </CardContent>
      </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="font-headline">Transactions</CardTitle>
            <CardDescription>View and manage your income and expenses.</CardDescription>
        </div>
        <Button size="sm" className="gap-1" onClick={handleAdd}>
            <PlusCircle className="h-3.5 w-3.5" />
            Add Transaction
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((tx) => (
              <TableRow key={tx.id as string}>
                <TableCell className="font-medium">{tx.description}</TableCell>
                <TableCell>
                  <Badge variant="outline">{tx.category}</Badge>
                </TableCell>
                <TableCell>
                   <Badge variant={tx.type === 'income' ? 'default' : 'destructive'} className="capitalize">
                    {tx.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{tx.paymentMethod}</Badge>
                </TableCell>
                <TableCell>{tx.date}</TableCell>
                <TableCell className={`text-right font-medium ${tx.type === 'income' ? 'text-accent' : 'text-destructive'}`}>
                  {tx.type === 'income' ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(tx)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(tx.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
    <TransactionForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleFormSubmit}
        transaction={selectedTransaction}
    />
    </>
  );
}
