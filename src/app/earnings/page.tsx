
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Loader2, Badge } from "lucide-react";
import { useState } from "react";
import type { Earning } from "@/lib/types";
import { EarningForm } from "@/components/earnings/earning-form";
import { useAppContext } from "@/context/app-provider";

export default function EarningsPage() {
    const { earnings, addEarning, updateEarning, deleteEarning, isLoading } = useAppContext();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedEarning, setSelectedEarning] = useState<Earning | undefined>(undefined);

    const handleAdd = () => {
        setSelectedEarning(undefined);
        setIsFormOpen(true);
    }

    const handleEdit = (earning: Earning) => {
        setSelectedEarning(earning);
        setIsFormOpen(true);
    }

    const handleDelete = async (earning: Earning) => {
        await deleteEarning(earning);
    }

    const handleFormSubmit = async (earning: Omit<Earning, 'id' | '_id'>) => {
        if(selectedEarning) {
            await updateEarning({ ...earning, id: selectedEarning.id, _id: selectedEarning._id });
        } else {
            await addEarning(earning);
        }
        setIsFormOpen(false);
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Earnings</CardTitle>
                    <CardDescription>Track your income sources.</CardDescription>
                </div>
                <Button size="sm" className="gap-1" onClick={handleAdd}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Earning
                </Button>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                       {earnings.map((earning: Earning) => (
                            <TableRow key={earning.id}>
                                <TableCell className="font-medium">{earning.description}</TableCell>
                                <TableCell>
                                    <span className="capitalize">{earning.type}</span>
                                </TableCell>
                                <TableCell>{earning.date}</TableCell>
                                <TableCell className="text-right text-accent">+₹{earning.amount.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(earning)}>Edit</Button>
                                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(earning)}>Delete</Button>
                                </TableCell>
                            </TableRow>
                       ))}
                    </TableBody>
                </Table>
            </CardContent>
            <EarningForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                earning={selectedEarning}
            />
        </Card>
    );
}
