import mongoose, { Connection } from "mongoose";

const MONGODB_URI = process.env.mongo_uri ?? process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the mongo_uri environment variable inside .env (server-side only)."
  );
}

/**
 * Cache interface to store mongoose connection and in-flight promise.
 * This prevents creating multiple connections during development (HMR).
 */
interface MongooseCache {
  conn: Connection | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Persist cache across module reloads so HMR doesn't create multiple connections.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  var mongooseCache: MongooseCache | undefined;
}

const opts: mongoose.ConnectOptions = {
  bufferCommands: false, // fail fast if not connected
  // other options can be added depending on mongoose version
};

if (!global.mongooseCache) {
  global.mongooseCache = { conn: null, promise: null };
}

/**
 * connectToDatabase
 * - Reuses cached connection if available.
 * - If connection is in-flight, waits for the same promise.
 * - Returns mongoose.Connection.
 */
export default async function connectToDatabase(): Promise<Connection> {
  // return cached connection when available
  if (global.mongooseCache?.conn) {
    return global.mongooseCache.conn;
  }

  // create in-flight promise if none exists
  if (!global.mongooseCache?.promise) {
    global.mongooseCache!.promise = mongoose.connect(MONGODB_URI!, opts);
  }

  // await connection and cache the resulting connection
  const mongooseInstance = await global.mongooseCache!.promise;
  global.mongooseCache!.conn = mongooseInstance.connection;

  return global.mongooseCache!.conn;
}