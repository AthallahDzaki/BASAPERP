import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/products/stats
export async function GET() {
  try {
    await connectDB();

    const stats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$cost', '$stockQty'] } },
          avgPrice: { $avg: '$price' },
          lowStock: {
            $sum: {
              $cond: [{ $lt: ['$stockQty', '$minStockQty'] }, 1, 0],
            },
          },
        },
      },
    ]);

    const categoryStats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalProducts: 0,
          totalValue: 0,
          avgPrice: 0,
          lowStock: 0,
        },
        byCategory: categoryStats,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
