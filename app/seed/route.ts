import bcrypt from 'bcrypt';
import { MongoClient } from 'mongodb';
import { users, suburbs, properties } from '../lib/placeholder-data';

async function seedData() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in .env.local');
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(); // Use your db name if not default

    // Seed users (hash passwords)
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );
    await db.collection('users').insertMany(hashedUsers, { ordered: false });

    // Seed suburbs
    await db.collection('suburbs').insertMany(suburbs, { ordered: false });

    // Seed properties
    await db.collection('properties').insertMany(properties, { ordered: false });

    console.log('Seeding completed');
  } finally {
    await client.close();
  }
}

export async function GET() {
  try {
    await seedData();
    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seeding error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
