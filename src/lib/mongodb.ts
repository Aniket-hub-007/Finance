import { Db, MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB = process.env.MONGO_DB;

if (!MONGO_URI) {
  throw new Error(
    'Please define the MONGO_URI environment variable inside .env.local'
  );
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(MONGO_URI!);

  const dbName = new URL(MONGO_URI!).pathname.substring(1) || 'finance-flow';
  const db = client.db(dbName);
  
  cachedClient = client;
  cachedDb = db;

  return db;
}
