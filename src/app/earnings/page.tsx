
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Loader2, DollarSign, Calendar, BarChart } from "lucide-react";
import { useState, useMemo } from "react";
import type { Earning } from "@/lib/types";
import { EarningForm } from "@/components/earnings/earning-form";
import { useAppContext } from "@/context/app-provider";
import { subDays, isAfter, parseISO } from 'date-fns';

export default function EarningsPage() {
    const { earnings, addEarning, updateEarning, deleteEarning, isLoading } = useAppContext();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedEarning, setSelectedEarning] = useState<Earning | undefined>(undefined);

    const { lifetimeEarnings, earningsLast7Days, earningsLast28Days } = useMemo(() => {
        const today = new Date();
        const sevenDaysAgo = subDays(today, 7);
        const twentyEightDaysAgo = subDays(today, 28);

        const lifetime = earnings.reduce((acc, e) => acc + e.amount, 0);
        
        const last7 = earnings
            .filter(e => e.date && isAfter(parseISO(e.date), sevenDaysAgo))
            .reduce((acc, e) => acc + e.amount, 0);

        const last28 = earnings
            .filter(e => e.date && isAfter(parseISO(e.date), twentyEightDaysAgo))
            .reduce((acc, e) => acc + e.amount, 0);

        return { 
            lifetimeEarnings: lifetime,
            earningsLast7Days: last7,
            earningsLast28Days: last28,
        };
    }, [earnings]);

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
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-headline font-semibold">Earnings</h1>
                    <p className="text-muted-foreground">Track your income sources and their performance.</p>
                </div>
                 <Button size="sm" className="gap-1" onClick={handleAdd}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Earning
                </Button>
            </div>
             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lifetime Earnings</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{lifetimeEarnings.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Total earnings recorded</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Earnings (Last 28 Days)</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{earningsLast28Days.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Income in the last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Earnings (Last 7 Days)</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{earningsLast7Days.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Income in the last week</p>
                  </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline">Earnings Log</CardTitle>
                        <CardDescription>A detailed list of all your income.</CardDescription>
                    </div>
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
        </div>
    );
}
