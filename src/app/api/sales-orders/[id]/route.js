import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { SalesOrder } from '@/models';

// GET /api/sales-orders/:id
export async function GET(request, { params }) {
  try {
    await connectDB();
    const salesOrder = await SalesOrder.findById(params.id)
      .populate('customer')
      .populate('items.product');
    if (!salesOrder) {
      return NextResponse.json(
        { success: false, message: 'Sales Order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: salesOrder });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/sales-orders/:id
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Recalculate totals if items changed
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
    
    const salesOrder = await SalesOrder.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!salesOrder) {
      return NextResponse.json(
        { success: false, message: 'Sales Order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: salesOrder });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/sales-orders/:id
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const salesOrder = await SalesOrder.findByIdAndDelete(params.id);
    if (!salesOrder) {
      return NextResponse.json(
        { success: false, message: 'Sales Order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Sales Order deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
