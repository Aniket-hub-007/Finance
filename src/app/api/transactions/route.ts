
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { Transaction } from '@/lib/types';

const getDb = async () => {
  const client = await clientPromise;
  return client.db("FinanceFlow");
};

export async function GET() {
  try {
    const db = await getDb();
    const transactions = await db.collection('transactions').find({}).sort({ date: -1 }).toArray();
    const sanitizedTransactions = transactions.map(tx => ({
        ...tx,
        id: tx._id.toString(),
        _id: tx._id.toString(),
    }));
    return NextResponse.json({ success: true, data: sanitizedTransactions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const transaction: Omit<Transaction, 'id' | '_id'> = await request.json();
    const db = await getDb();
    const result = await db.collection('transactions').insertOne(transaction);
    const newTransaction = { ...transaction, _id: result.insertedId, id: result.insertedId.toString() };
    return NextResponse.json({ success: true, data: newTransaction }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to add transaction' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const transaction: Transaction = await request.json();
        const { id, ...dataToUpdate } = transaction; 
        if (!id) {
             return NextResponse.json({ success: false, error: 'Transaction ID is required' }, { status: 400 });
        }
        const db = await getDb();

        // @ts-ignore
        delete dataToUpdate._id;

        const result = await db.collection('transactions').updateOne(
            { _id: new ObjectId(id as string) },
            { $set: dataToUpdate }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
        }

        const updatedTransaction = { ...dataToUpdate, id: id, _id: new ObjectId(id) };
        return NextResponse.json({ success: true, data: { ...updatedTransaction, _id: updatedTransaction._id.toString() } });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Failed to update transaction' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, error: 'Transaction ID is required' }, { status: 400 });
        }
        const db = await getDb();
        const result = await db.collection('transactions').deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Failed to delete transaction' }, { status: 500 });
    }
}
