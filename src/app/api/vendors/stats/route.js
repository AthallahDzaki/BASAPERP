import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Vendor } from '@/models'

// GET /api/vendors/stats
export async function GET() {
  try {
    await connectDB()

    // sederhana: total & aktif
    const totalVendors = await Vendor.countDocuments({})
    const activeVendors = await Vendor.countDocuments({ isActive: true })

    // avg rating (handle missing rating)
    const avgRatingAgg = await Vendor.aggregate([
      { $match: {} },
      {
        $group: {
          _id: null,
          avgRating: { $avg: { $ifNull: ['$rating', 0] } }
        }
      }
    ])
    const avgRating = (avgRatingAgg[0] && avgRatingAgg[0].avgRating) ? Number(avgRatingAgg[0].avgRating) : 0

    // vendors by country (optional, fallback 'Unknown' when no country)
    const byCountry = await Vendor.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$address.country', 'Unknown'] },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          country: '$_id',
          count: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ])

    return NextResponse.json({
      success: true,
      data: {
        vendorCount: {
          total: totalVendors,
          active: activeVendors,
          avgRating
        },
        byCountry
      }
    })
  } catch (error) {
    console.error('GET /api/vendors/stats error:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}