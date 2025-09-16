
import { getDb } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const goals = await db.collection('goals').find({}).toArray();
    const sanitized = goals.map(item => ({
        ...item,
        id: item._id.toString(),
        _id: item._id.toString(),
    })).filter(Boolean);
    return NextResponse.json({ success: true, data: sanitized });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const goal = await request.json();
    const db = await getDb();
    const result = await db.collection('goals').insertOne(goal);
    const newGoal = {
        ...goal,
        _id: result.insertedId,
        id: result.insertedId.toString()
    }
    return NextResponse.json({ success: true, data: newGoal }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to add data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const goal = await request.json();
    const { id, _id, ...dataToUpdate } = goal;

    const db = await getDb();
    const result = await db.collection('goals').updateOne(
        { _id: new ObjectId(id) },
        { $set: dataToUpdate }
    );
     if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: goal });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to update data' }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const db = await getDb();
    const result = await db.collection('goals').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to delete data' }, { status: 500 });
  }
}
