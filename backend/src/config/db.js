import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in the backend .env file')
    }

    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    })
    console.log(`MongoDB connected: ${connection.connection.host}`)
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`)
    console.error('If you are using MongoDB Atlas, confirm the cluster is reachable and your IP is whitelisted.')
    console.error('If you are using a local database, make sure MongoDB is running and the URI is mongodb://127.0.0.1:27017/shaynestyles')
    process.exit(1)
  }
}

export default connectDB
