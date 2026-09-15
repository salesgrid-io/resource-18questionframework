import { MongoClient, type MongoClientOptions } from "mongodb"
import { env } from "@/lib/env"

declare global {
  var __urbanUnityMongoClientPromise: Promise<MongoClient> | undefined
}

const uri = env.mongodbUri

if (!uri) {
  throw new Error("Missing MONGODB_URI")
}

// Tuned for Vercel serverless talking to a self-hosted mongod over the public
// internet. The driver defaults (100-connection pool per instance, 30s server
// selection, no idle reaping) left hundreds of sockets open on the box and turned
// every transient blip into a 500 on /api/funnel/events.
const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 30_000,
  waitQueueTimeoutMS: 10_000,
  serverSelectionTimeoutMS: 10_000,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
  // Lambdas freeze between invocations, so a tight heartbeat just guarantees the
  // monitor wakes up on a dead socket ("server monitor timeout").
  heartbeatFrequencyMS: 30_000,
  retryReads: true,
  retryWrites: true,
}

function createClientPromise() {
  const promise = new MongoClient(uri, options).connect()
  // A cached rejected promise would poison every later request in this instance,
  // so drop it and let the next call reconnect.
  promise.catch(() => {
    if (global.__urbanUnityMongoClientPromise === promise) {
      global.__urbanUnityMongoClientPromise = undefined
    }
  })
  return promise
}

// Reuse across invocations and dev hot reloads. Previously `new MongoClient(uri)`
// ran at module scope unconditionally, orphaning a client and its pool on every
// re-evaluation even when the cached promise was reused.
export const mongoClientPromise =
  global.__urbanUnityMongoClientPromise ?? (global.__urbanUnityMongoClientPromise = createClientPromise())

export async function getDb() {
  const mongo = await mongoClientPromise
  return mongo.db(env.mongodbDbName)
}
