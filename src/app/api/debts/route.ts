
import { getDb } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const debts = await db.collection('debts').find({}).toArray();
    const sanitized = debts.map(item => ({
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
    const debt = await request.json();
    const db = await getDb();
    const result = await db.collection('debts').insertOne(debt);
    const newDebt = {
        ...debt,
        _id: result.insertedId,
        id: result.insertedId.toString()
    }
    return NextResponse.json({ success: true, data: newDebt }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to add data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const debt = await request.json();
    const { id, _id, ...dataToUpdate } = debt;

    const db = await getDb();
    const result = await db.collection('debts').updateOne(
        { _id: new ObjectId(id) },
        { $set: dataToUpdate }
    );
     if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: debt });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to update data' }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const db = await getDb();
    const result = await db.collection('debts').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to delete data' }, { status: 500 });
  }
}
