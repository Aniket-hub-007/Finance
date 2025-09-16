
import { getDb } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const transactions = await db.collection('transactions').find({}).toArray();
    const sanitizedTransactions = transactions.map(tx => ({
        ...tx,
        id: tx._id.toString(),
        _id: tx._id.toString(),
    })).filter(Boolean);
    return NextResponse.json({ success: true, data: sanitizedTransactions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const transaction = await request.json();
    const db = await getDb();
    const result = await db.collection('transactions').insertOne(transaction);
    const newTransaction = {
        ...transaction,
        _id: result.insertedId,
        id: result.insertedId.toString()
    }
    return NextResponse.json({ success: true, data: newTransaction }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to add transaction' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const transaction = await request.json();
    const { id, _id, ...dataToUpdate } = transaction;

    const db = await getDb();
    const result = await db.collection('transactions').updateOne(
        { _id: new ObjectId(id) },
        { $set: dataToUpdate }
    );
     if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to update transaction' }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const db = await getDb();
    const result = await db.collection('transactions').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to delete transaction' }, { status: 500 });
  }
}
