
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { Debt } from '@/lib/types';

const getDb = async () => {
  const client = await clientPromise;
  return client.db("FinanceFlow");
};

const getCollection = async () => {
  const db = await getDb();
  return db.collection('debts');
}

export async function GET() {
  try {
    const collection = await getCollection();
    const debts = await collection.find({}).toArray();
    return NextResponse.json({ success: true, data: debts.map(d => ({ ...d, id: d._id.toString() })) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch debts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const debt: Omit<Debt, 'id' | '_id'> = await request.json();
    const collection = await getCollection();
    const result = await collection.insertOne(debt);
    const newDebt = { ...debt, _id: result.insertedId, id: result.insertedId.toString() };
    return NextResponse.json({ success: true, data: newDebt }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to add debt' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const debt: Debt = await request.json();
        const { id, ...dataToUpdate } = debt;
        if (!id) {
             return NextResponse.json({ success: false, error: 'Debt ID is required' }, { status: 400 });
        }
        const collection = await getCollection();
        // @ts-ignore
        delete dataToUpdate._id;
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: dataToUpdate }
        );
        if (result.matchedCount === 0) {
            return NextResponse.json({ success: false, error: 'Debt not found' }, { status: 404 });
        }
        const updatedDebt = { ...dataToUpdate, id, _id: new ObjectId(id) };
        return NextResponse.json({ success: true, data: updatedDebt });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Failed to update debt' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, error: 'Debt ID is required' }, { status: 400 });
        }
        const collection = await getCollection();
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return NextResponse.json({ success: false, error: 'Debt not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Failed to delete debt' }, { status: 500 });
    }
}
