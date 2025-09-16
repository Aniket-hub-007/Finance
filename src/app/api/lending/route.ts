
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { Lending } from '@/lib/types';

const getDb = async () => {
  const client = await clientPromise;
  return client.db("FinanceFlow");
};

const getCollection = async () => {
  const db = await getDb();
  return db.collection('lending');
}

export async function GET() {
  try {
    const collection = await getCollection();
    const lending = await collection.find({}).toArray();
    return NextResponse.json({ success: true, data: lending.map(l => ({ ...l, id: l._id.toString(), _id: l._id.toString() })) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch lending data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const lendingItem: Omit<Lending, 'id' | '_id'> = await request.json();
    const collection = await getCollection();
    const result = await collection.insertOne(lendingItem);
    const newLendingItem = { ...lendingItem, _id: result.insertedId, id: result.insertedId.toString() };
    return NextResponse.json({ success: true, data: newLendingItem }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to add lending data' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const lendingItem: Lending = await request.json();
        const { id, ...dataToUpdate } = lendingItem;
        if (!id) {
             return NextResponse.json({ success: false, error: 'Lending ID is required' }, { status: 400 });
        }
        const collection = await getCollection();
        // @ts-ignore
        delete dataToUpdate._id;
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: dataToUpdate }
        );
        if (result.matchedCount === 0) {
            return NextResponse.json({ success: false, error: 'Lending item not found' }, { status: 404 });
        }
        const updatedLending = { ...dataToUpdate, id, _id: new ObjectId(id) };
        return NextResponse.json({ success: true, data: updatedLending });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Failed to update lending data' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, error: 'Lending ID is required' }, { status: 400 });
        }
        const collection = await getCollection();
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return NextResponse.json({ success: false, error: 'Lending item not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Failed to delete lending data' }, { status: 500 });
    }
}
