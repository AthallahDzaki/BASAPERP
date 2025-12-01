import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SalesOrder from '@/models/SalesOrder';

// GET /api/sales-orders/stats
export async function GET() {
  try {
    await connectDB();
    
    const stats = await SalesOrder.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' },
        },
      },
    ]);

    const statusStats = await SalesOrder.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$total' },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0,
        },
        byStatus: statusStats,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
