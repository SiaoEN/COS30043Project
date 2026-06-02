// import mongoose from 'mongoose'

// const connectDB = async () => {
//   try {
//     if (!process.env.MONGODB_URI) {
//       throw new Error('MONGODB_URI is not set in the backend .env file')
//     }

//     const connection = await mongoose.connect(process.env.MONGODB_URI, {
//       serverSelectionTimeoutMS: 10000
//     })
//     console.log(`MongoDB connected: ${connection.connection.host}`)
//   } catch (error) {
//     console.error(`MongoDB connection error: ${error.message}`)
//     console.error('If you are using MongoDB Atlas, confirm the cluster is reachable and your IP is whitelisted.')
//     console.error('If you are using a local database, make sure MongoDB is running and the URI is mongodb://127.0.0.1:27017/shaynestyles')
//     process.exit(1)
//   }
// }

// export default connectDB
// import mongoose from 'mongoose';
// import Grid from 'gridfs-stream';

// let gfs; // GridFS instance

// const connectDB = async () => {
//   try {
//     if (!process.env.MONGODB_URI) {
//       throw new Error('MONGODB_URI is not set in the backend .env file');
//     }

//     const connection = await mongoose.connect(process.env.MONGODB_URI, {
//       serverSelectionTimeoutMS: 10000
//     });

//     console.log(`MongoDB connected: ${connection.connection.host}`);

//     // Initialize GridFS once the connection is open
//     const conn = mongoose.connection;
//     conn.once('open', () => {
//       gfs = Grid(conn.db, mongoose.mongo);
//       gfs.collection('uploads'); // bucket name for storing files
//       console.log('GridFS initialized');
//     });

//   } catch (error) {
//     console.error(`MongoDB connection error: ${error.message}`);
//     console.error('If you are using MongoDB Atlas, confirm the cluster is reachable and your IP is whitelisted.');
//     console.error('If you are using a local database, make sure MongoDB is running and the URI is mongodb://127.0.0.1:27017/shaynestyles');
//     process.exit(1);
//   }
// };

// export { connectDB, gfs };

// config/db.js

import mongoose from 'mongoose'
import { GridFSBucket } from 'mongodb'

let bucket = null

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)

    console.log(`MongoDB connected: ${conn.connection.host}`)

    bucket = new GridFSBucket(
      mongoose.connection.db,
      {
        bucketName: 'uploads'
      }
    )

    console.log('GridFSBucket initialized')

  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

const getBucket = () => {
  if (!bucket) {
    throw new Error('GridFSBucket not initialized')
  }
  return bucket
}

export { connectDB, getBucket }