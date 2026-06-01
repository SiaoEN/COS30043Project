import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import Order from '../models/Order.js'

dotenv.config()

const migrateOrdersCollection = async () => {
  try {
    await connectDB()

    const legacyCollection = mongoose.connection.db.collection('orders')
    const legacyOrders = await legacyCollection.find({}).toArray()

    if (!legacyOrders.length) {
      console.log('No legacy orders found in lowercase collection')
      process.exit(0)
    }

    const operations = legacyOrders.map((doc) => ({
      replaceOne: {
        filter: { _id: doc._id },
        replacement: doc,
        upsert: true
      }
    }))

    const result = await Order.collection.bulkWrite(operations, { ordered: false })

    await legacyCollection.drop()

    console.log(`Migrated ${legacyOrders.length} legacy order(s) into Order`)
    console.log(`Upserted: ${result.upsertedCount || 0}, modified: ${result.modifiedCount || 0}`)
    console.log('Dropped legacy lowercase orders collection')
    process.exit(0)
  } catch (error) {
    if (error?.codeName === 'NamespaceNotFound') {
      console.log('Legacy lowercase orders collection does not exist')
      process.exit(0)
    }

    console.error(`Order migration failed: ${error.message}`)
    process.exit(1)
  }
}

migrateOrdersCollection()