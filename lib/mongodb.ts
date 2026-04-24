import { MongoClient } from "mongodb"
import { env } from "@/lib/env"

declare global {
  var __urbanUnityMongoClientPromise: Promise<MongoClient> | undefined
}

const uri = env.mongodbUri

if (!uri) {
  throw new Error("Missing MONGODB_URI")
}

const client = new MongoClient(uri)

export const mongoClientPromise =
  global.__urbanUnityMongoClientPromise ?? (global.__urbanUnityMongoClientPromise = client.connect())

export async function getDb() {
  const mongo = await mongoClientPromise
  return mongo.db(env.mongodbDbName)
}
