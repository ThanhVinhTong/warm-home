import { dbConnect } from '@/app/lib/db/mongodb';
import { Suburb, Property } from '@/app/lib/definitions';

// Get unique states
export async function getStates() {
  const { db, client } = await dbConnect();
  try {
    return await db.collection('suburbs').distinct('state');
  } finally {
    await client.close();
  }
}

// Get unique suburbs, optionally filtered by state
export async function getSuburbs(state?: string) {
  const { db, client } = await dbConnect();
  try {
    const query = state ? { state } : {};
    return await db.collection('suburbs').distinct('name', query);
  } finally {
    await client.close();
  }
}

// Bar chart data: Median house prices by suburb, filtered by state
export async function getBarChartData(state?: string) {
  const { db, client } = await dbConnect();
  try {
    const query = state ? { state } : {};
    const suburbs = await db.collection('suburbs').find(query).toArray() as unknown as Suburb[];
    return suburbs.map((suburb) => ({
      suburb: suburb.name,
      medianPrice: suburb.medianHousePrice,
    }));
  } finally {
    await client.close();
  }
}

// Line graph data: Simulate price trend using growthRate (since Property lacks date)
export async function getLineGraphData(suburb?: string) {
    const { db, client } = await dbConnect();
    try {
      const match = suburb ? { suburbId: (await db.collection('suburbs').findOne({ name: suburb }))?.id } : {};
      const data = await db.collection('properties').aggregate([
        { $match: match },
        {
          $group: {
            _id: { $year: '$date' },
            avgPrice: { $avg: '$price' },
          },
        },
        { $sort: { _id: 1 } },
      ]).toArray();
      return data.map((d) => ({ year: d._id, avgPrice: d.avgPrice }));
    } finally {
      await client.close();
    }
  }

// City (state) comparison: Average median prices per state
export async function getCityComparisonData() {
  const { db, client } = await dbConnect();
  try {
    const data = await db.collection('suburbs').aggregate([
      {
        $group: {
          _id: '$state',
          avgMedianPrice: { $avg: '$medianHousePrice' },
        },
      },
      { $sort: { avgMedianPrice: -1 } },
    ]).toArray();
    return data.map((d) => ({ state: d._id, avgMedianPrice: d.avgMedianPrice }));
  } finally {
    await client.close();
  }
}

// Stats: Min/max/avg for a suburb or state
export async function getStats({ state, suburb }: { state?: string; suburb?: string }) {
  const { db, client } = await dbConnect();
  try {
    let match = {};
    if (state || suburb) {
        // Build match criteria for suburbs
        let suburbMatch = {};
        if (state) suburbMatch = { ...suburbMatch, state };
        if (suburb) suburbMatch = { ...suburbMatch, name: suburb };
        
        // Get suburb IDs that match the criteria
        const matchingSuburbs = await db.collection('suburbs').find(suburbMatch).toArray();
        const suburbIds = matchingSuburbs.map(s => s.id);
        
        console.log(`Found ${matchingSuburbs.length} matching suburbs:`, matchingSuburbs.map(s => ({ name: s.name, state: s.state })));
        console.log(`Suburb IDs:`, suburbIds);
        
        // Match properties by suburb IDs
        if (suburbIds.length > 0) {
          match = { suburbId: { $in: suburbIds } };
        }
    }
    
    const [stats] = await db.collection('properties').aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' },
        },
      },
    ]).toArray();
    
    return stats || { minPrice: 0, maxPrice: 0, avgPrice: 0 };
  } finally {
    await client.close();
  }
}