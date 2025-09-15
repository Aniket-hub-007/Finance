
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
import { PlusCircle } from 'lucide-react';
import { transactions as initialTransactions } from '@/lib/data';
import { useState } from 'react';
import type { Transaction } from '@/lib/types';
import { TransactionForm } from '@/components/transactions/transaction-form';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);

    const handleAdd = () => {
        setSelectedTransaction(undefined);
        setIsFormOpen(true);
    }

    const handleEdit = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsFormOpen(true);
    }

    const handleDelete = (id: string | number) => {
        setTransactions(transactions.filter(t => t.id !== id));
    }

    const handleFormSubmit = (transaction: Transaction) => {
        if(selectedTransaction) {
            setTransactions(transactions.map(t => t.id === transaction.id ? transaction : t));
        } else {
            setTransactions([...transactions, { ...transaction, id: Date.now() }]);
        }
        setIsFormOpen(false);
    }


  return (
    <>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-medium">{tx.description}</TableCell>
                <TableCell>
                  <Badge variant="outline">{tx.category}</Badge>
                </TableCell>
                <TableCell>
                   <Badge variant={tx.type === 'income' ? 'default' : 'secondary'} className={tx.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {tx.type}
                  </Badge>
                </TableCell>
                <TableCell>{tx.date}</TableCell>
                <TableCell className={`text-right font-medium ${tx.type === 'income' ? 'text-green-600' : ''}`}>
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
