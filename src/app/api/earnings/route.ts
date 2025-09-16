
import { getDb } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const earnings = await db.collection('earnings').find({}).toArray();
    const sanitized = earnings.map(item => ({
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
    const earning = await request.json();
    const db = await getDb();
    const result = await db.collection('earnings').insertOne(earning);
    const newEarning = {
        ...earning,
        _id: result.insertedId,
        id: result.insertedId.toString()
    }
    return NextResponse.json({ success: true, data: newEarning }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to add data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const earning = await request.json();
    const { id, _id, ...dataToUpdate } = earning;

    const db = await getDb();
    const result = await db.collection('earnings').updateOne(
        { _id: new ObjectId(id) },
        { $set: dataToUpdate }
    );
     if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: earning });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to update data' }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const db = await getDb();
    const result = await db.collection('earnings').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to delete data' }, { status: 500 });
  }
}
