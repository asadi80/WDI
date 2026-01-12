
// import { MongoClient } from 'mongodb';

// const uri = process.env.MONGODB_URI;

// // Detect if using MongoDB Atlas (cloud) or local
// const isAtlas = uri?.includes('mongodb+srv://') || uri?.includes('mongodb.net');

// const options = {
//   ...(isAtlas && {
//     tls: true,
//     tlsAllowInvalidCertificates: true,
//   }),
//   serverSelectionTimeoutMS: 5000,
// };

// let client;
// let clientPromise;

// if (!process.env.MONGODB_URI) {
//   throw new Error('Please add your Mongo URI to .env.local');
// }

// if (process.env.NODE_ENV === 'development') {
//   if (!global._mongoClientPromise) {
//     client = new MongoClient(uri, options);
//     global._mongoClientPromise = client.connect();
//   }
//   clientPromise = global._mongoClientPromise;
// } else {
//   client = new MongoClient(uri, options);
//   clientPromise = client.connect();
// }

// export default clientPromise;