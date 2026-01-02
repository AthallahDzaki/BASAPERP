import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Customer } from '@/models'

// GET /api/vendors/stats
export async function GET() {
  try {
    await connectDB()
    const currentCustomer = await Customer.countDocuments({ isActive: true })

    return NextResponse.json({
      success: true,
      data: {
        customerCount : currentCustomer
      }
    })
  } catch (error) {
    console.error('GET /api/customer/stats error:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}