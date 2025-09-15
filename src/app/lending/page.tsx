
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import type { Lending } from "@/lib/types";
import { LendingForm } from "@/components/lending/lending-form";
import { useAppContext } from "@/context/app-provider";


export default function LendingPage() {
    const { lending: loans, setLending: setLoans } = useAppContext() as any;
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<Lending | undefined>(undefined);

    const handleAdd = () => {
        setSelectedLoan(undefined);
        setIsFormOpen(true);
    }

    const handleEdit = (loan: Lending) => {
        setSelectedLoan(loan);
        setIsFormOpen(true);
    }

    const handleDelete = (id: string | number) => {
        setLoans(loans.filter((l: Lending) => l.id !== id));
    }

    const handleFormSubmit = (loan: Lending) => {
        if(selectedLoan) {
            setLoans(loans.map((l: Lending) => l.id === loan.id ? loan : l));
        } else {
            setLoans([...loans, { ...loan, id: Date.now() }]);
        }
        setIsFormOpen(false);
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Lending Management</CardTitle>
                    <CardDescription>Track money you have lent to others.</CardDescription>
                </div>
                <Button size="sm" className="gap-1" onClick={handleAdd}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Loan
                </Button>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Borrower</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                       {loans.map((loan: Lending) => (
                            <TableRow key={loan.id}>
                                <TableCell className="font-medium">{loan.borrower}</TableCell>
                                <TableCell>{loan.status}</TableCell>
                                <TableCell>{loan.date}</TableCell>
                                <TableCell className="text-right">₹{loan.amount.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(loan)}>Edit</Button>
                                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(loan.id)}>Delete</Button>
                                </TableCell>
                            </TableRow>
                       ))}
                    </TableBody>
                </Table>
            </CardContent>
            <LendingForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                loan={selectedLoan}
            />
        </Card>
    );
}
