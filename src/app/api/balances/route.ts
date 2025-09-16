
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { Balances } from '@/lib/types';

const getDb = async () => {
  const client = await clientPromise;
  return client.db("FinanceFlow");
};

const getCollection = async () => {
  const db = await getDb();
  return db.collection('balances');
}

export async function GET() {
  try {
    const collection = await getCollection();
    let balances = await collection.findOne({});
    if (!balances) {
      // If no balance document exists, create one with default values
      const defaultBalances: Omit<Balances, 'id' | '_id'> = { bank: 12050.75, upi: 2500.50, cash: 850.00 };
      const result = await collection.insertOne(defaultBalances);
      balances = {
        ...defaultBalances,
        _id: result.insertedId,
      };
    }
    const response = { ...balances, id: balances._id.toString(), _id: balances._id.toString() };
    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch balances' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const dataToUpdate: Partial<Balances> = await request.json();
        
        // Remove id/_id fields if they exist, as we don't want to set them.
        delete dataToUpdate.id;
        delete dataToUpdate._id;
        
        const collection = await getCollection();
        
        // Find the single balance document. We assume there's only one.
        const currentBalanceDoc = await collection.findOne({});
        if (!currentBalanceDoc) {
             return NextResponse.json({ success: false, error: 'Balance document not found' }, { status: 404 });
        }

        const result = await collection.updateOne(
            { _id: currentBalanceDoc._id },
            { $set: dataToUpdate }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ success: false, error: 'Balance document not found' }, { status: 404 });
        }

        const updatedDocument = await collection.findOne({ _id: currentBalanceDoc._id });
        const updatedBalances = { ...updatedDocument, id: currentBalanceDoc._id.toString(), _id: currentBalanceDoc._id.toString() };
        return NextResponse.json({ success: true, data: updatedBalances });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Failed to update balances' }, { status: 500 });
    }
}
