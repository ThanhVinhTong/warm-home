import { MongoClient } from 'mongodb';
import {
  User,
  Suburb,
  Property
} from './definitions';
import { formatCurrency } from './utils';
import { ObjectId } from 'mongodb';

// Remove sql and Postgres functions, replace with MongoDB equivalents
async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not defined');
  const client = new MongoClient(uri);
  await client.connect();
  return { db: client.db(), client };
}

// Example: Fetch suburb price overviews
export async function fetchSuburbOverviews() {
  const { db, client } = await getDb();
  try {
    return await db.collection('suburbs').find({}).toArray();
  } finally {
    await client.close();
  }
}

// Fetch properties (for search)
export async function fetchProperties(query = {}) {
  const { db, client } = await getDb();
  try {
    return await db.collection('properties').find(query).toArray();
  } finally {
    await client.close();
  }
}

// Fetch users (for chatbot/auth)
export async function fetchUsers() {
  const { db, client } = await getDb();
  try {
    return await db.collection('users').find({}).toArray();
  } finally {
    await client.close();
  }
}
