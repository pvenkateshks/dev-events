import mongoose from 'mongoose';

// Define the MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Validate that the MongoDB URI is provided
if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// TypeScript interface for the cached connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the global namespace to include our mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Initialize the cache object
// In development, use a global variable to preserve the connection across hot reloads
// In production, the connection will be created fresh each time
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connects to MongoDB using Mongoose and caches the connection.
 *
 * If a connection attempt fails, the in-flight cached promise is cleared so subsequent calls may retry.
 *
 * @returns The connected Mongoose module.
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Return existing promise if connection is in progress
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering to fail fast in serverless environments
    };

    // Create new connection promise
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('MongoDB connected successfully');
      return mongooseInstance;
    });
  }

  try {
    // Await the connection promise and cache the result
    cached.conn = await cached.promise;
  } catch (error) {
    // Clear the promise on error so retry is possible
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;