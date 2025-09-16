
import { getDb } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDb();
    let balances = await db.collection('balances').findOne({});
    if (!balances) {
      balances = { bank: 0, upi: 0, cash: 0 };
      await db.collection('balances').insertOne(balances);
    }
    const sanitizedBalances = {
        ...balances,
        id: balances._id.toString(),
        _id: balances._id.toString(),
    };
    return NextResponse.json({ success: true, data: sanitizedBalances });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch balances' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const balances = await request.json();
    const { id, _id, ...balancesToUpdate } = balances;
    const db = await getDb();
    const result = await db.collection('balances').updateOne(
        {},
        { $set: balancesToUpdate },
        { upsert: true }
    );

    const updatedDocument = await db.collection('balances').findOne({});
    
    return NextResponse.json({ success: true, data: updatedDocument });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to update balances' }, { status: 500 });
  }
}
