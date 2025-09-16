
import { getDb } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await getDb();
    const balances = await db.collection('balances').find({}).sort({ date: -1 }).toArray();
    const sanitizedBalances = balances.map(b => ({
        ...b,
        id: b._id.toString(),
        _id: b._id.toString(),
    }));
    return NextResponse.json({ success: true, data: sanitizedBalances });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch balances' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const balance = await request.json();
    const db = await getDb();
    const result = await db.collection('balances').insertOne(balance);
     const newBalance = {
        ...balance,
        _id: result.insertedId,
        id: result.insertedId.toString()
    }
    return NextResponse.json({ success: true, data: newBalance }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to add balance' }, { status: 500 });
  }
}
