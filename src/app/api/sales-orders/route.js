import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SalesOrder from '@/models/SalesOrder';

// GET /api/sales-orders
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const query = {};
    if (status) query.status = status;
    
    const salesOrders = await SalesOrder.find(query)
      .populate('customer', 'name email')
      .populate('items.product', 'name sku')
      .sort({ orderDate: -1 });
    return NextResponse.json({ success: true, data: salesOrders });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/sales-orders
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Calculate totals
    if (body.items && body.items.length > 0) {
      body.items = body.items.map(item => {
        const subtotal = item.quantity * item.unitPrice;
        const discountAmount = subtotal * (item.discount / 100);
        const taxAmount = (subtotal - discountAmount) * (item.tax / 100);
        return {
          ...item,
          subtotal: subtotal - discountAmount + taxAmount,
        };
      });
      
      const itemsTotal = body.items.reduce((sum, item) => sum + item.subtotal, 0);
      body.subtotal = itemsTotal;
      const discountAmount = itemsTotal * (body.discount / 100);
      const taxAmount = (itemsTotal - discountAmount) * (body.tax / 100);
      body.total = itemsTotal - discountAmount + taxAmount;
    }
    
    const salesOrder = await SalesOrder.create(body);
    return NextResponse.json(
      { success: true, data: salesOrder },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
