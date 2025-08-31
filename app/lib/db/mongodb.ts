import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import {
  User,
  Suburb,
  Property
} from '../definitions';

// Remove sql and Postgres functions, replace with MongoDB equivalents
export async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return { db: client.db(), client };
}

// Example: Fetch suburb price overviews
export async function fetchSuburbOverviews() {
  const { db, client } = await dbConnect();
  try {
    return await db.collection('suburbs').find({}).toArray();
  } finally {
    await client.close();
  }
}

// Fetch properties (for search)
export async function fetchProperties(query = {}) {
  const { db, client } = await dbConnect();
  try {
    return await db.collection('properties').find(query).toArray();
  } finally {
    await client.close();
  }
}

// Fetch users (for chatbot/auth)
export async function fetchUsers() {
  const { db, client } = await dbConnect();
  try {
    return await db.collection('users').find({}).toArray();
  } finally {
    await client.close();
  }
}
