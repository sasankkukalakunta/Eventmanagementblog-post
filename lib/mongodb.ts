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
 * Extend the global scope to persist the cache across module reloads in dev.
 * Using `globalThis`/`global` ensures the cache survives Next.js HMR.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  var mongooseCache: MongooseCache | undefined;
}

const opts: mongoose.ConnectOptions = {
  // Recommended options for modern mongoose versions
  bufferCommands: false, // Disable mongoose buffering; fail fast if not connected
  // other options like `useNewUrlParser`/`useUnifiedTopology` are set by default in newer versions,
  // but can be explicitly provided if your mongoose version supports them:
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
  // serverSelectionTimeoutMS: 5000,
};

if (!global.mongooseCache) {
  global.mongooseCache = { conn: null, promise: null };
}

/**
 * connectToDatabase
 * - Reuses a cached connection if available.
 * - If a connection is in progress, waits for the same promise to resolve.
 * - Returns a mongoose.Connection object ready for use with models.
 */
export default async function connectToDatabase(): Promise<Connection> {
  // Return cached connection if available
  if (global.mongooseCache?.conn) {
    return global.mongooseCache.conn;
  }

  // If no in-flight connection promise, create one
  if (!global.mongooseCache?.promise) {
    global.mongooseCache!.promise = mongoose.connect("mongodb+srv://sasank2309:sasank2309@cluster0.kiwya2p.mongodb.net/?appName=Cluster0", opts);
  }

  // Await the in-flight connection and cache the connection instance
  const mongooseInstance = await global.mongooseCache!.promise;
  global.mongooseCache!.conn = mongooseInstance.connection;

  // Optional: set some connection event handlers in production-ready apps
  // mongooseInstance.connection.on("connected", () => console.log("MongoDB connected"));
  // mongooseInstance.connection.on("error", (err) => console.error("MongoDB connection error:", err));

  return global.mongooseCache!.conn;
}