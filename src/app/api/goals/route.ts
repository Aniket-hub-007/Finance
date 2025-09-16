
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { SavingsGoal } from '@/lib/types';

const getDb = async () => {
  const client = await clientPromise;
  return client.db("FinanceFlow");
};

const getCollection = async () => {
  const db = await getDb();
  return db.collection('goals');
}

export async function GET() {
  try {
    const collection = await getCollection();
    const goals = await collection.find({}).toArray();
    return NextResponse.json({ success: true, data: goals.map(g => ({ ...g, id: g._id.toString(), _id: g._id.toString() })) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch goals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const goal: Omit<SavingsGoal, 'id' | '_id'> = await request.json();
    const collection = await getCollection();
    const result = await collection.insertOne(goal);
    const newGoal = { ...goal, _id: result.insertedId, id: result.insertedId.toString() };
    return NextResponse.json({ success: true, data: newGoal }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to add goal' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const goal: SavingsGoal = await request.json();
        const { id, ...dataToUpdate } = goal;
        if (!id) {
             return NextResponse.json({ success: false, error: 'Goal ID is required' }, { status: 400 });
        }
        const collection = await getCollection();
        // @ts-ignore
        delete dataToUpdate._id;
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: dataToUpdate }
        );
        if (result.matchedCount === 0) {
            return NextResponse.json({ success: false, error: 'Goal not found' }, { status: 404 });
        }
        const updatedGoal = { ...dataToUpdate, id, _id: new ObjectId(id) };
        return NextResponse.json({ success: true, data: { ...updatedGoal, _id: updatedGoal._id.toString() } });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Failed to update goal' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, error: 'Goal ID is required' }, { status: 400 });
        }
        const collection = await getCollection();
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return NextResponse.json({ success: false, error: 'Goal not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Failed to delete goal' }, { status: 500 });
    }
}
