import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import connectDB from '../config/db.js'
import User from '../models/User.js'

dotenv.config()

const seedAdmin = async () => {
  try {
    await connectDB()

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@shaynestyles.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin'
    const adminName = process.env.ADMIN_NAME || 'Admin'

    const existingAdmin = await User.findOne({ email: adminEmail })

    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin'
        await existingAdmin.save()
        console.log(`Admin role updated: ${adminEmail}`)
      } else {
        console.log(`Admin already exists: ${adminEmail}`)
      }
      process.exit(0)
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    })

    console.log(`Default admin created: ${adminEmail} / ${adminPassword}`)
    process.exit(0)
  } catch (error) {
    console.error(`Seed admin failed: ${error.message}`)
    process.exit(1)
  }
}

seedAdmin()
