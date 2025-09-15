import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";

const sampleLending = [
    { id: 1, borrower: 'John Doe', amount: 500, status: 'Paid', date: '2024-05-10' },
    { id: 2, borrower: 'Jane Smith', amount: 1200, status: 'Pending', date: '2024-07-01' },
];

export default function LendingPage() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Lending Management</CardTitle>
                    <CardDescription>Track money you have lent to others.</CardDescription>
                </div>
                <Button size="sm" className="gap-1">
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                       {sampleLending.map(loan => (
                            <TableRow key={loan.id}>
                                <TableCell className="font-medium">{loan.borrower}</TableCell>
                                <TableCell>{loan.status}</TableCell>
                                <TableCell>{loan.date}</TableCell>
                                <TableCell className="text-right">${loan.amount.toFixed(2)}</TableCell>
                            </TableRow>
                       ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
