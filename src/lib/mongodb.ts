import { MongoClient, type Db } from "mongodb";

const dbName = process.env.MONGODB_DB || "portfolio";

let clientPromise: Promise<MongoClient>;

declare global {
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global.mongoClientPromise) {
      global.mongoClientPromise = new MongoClient(uri).connect();
    }
    return global.mongoClientPromise;
  }

  if (!clientPromise) {
    clientPromise = new MongoClient(uri).connect();
  }

  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}
