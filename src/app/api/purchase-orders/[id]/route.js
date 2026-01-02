import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { PurchaseOrder } from '@/models';

// GET /api/purchase-orders/:id
export async function GET(request, { params }) {
  try {
    await connectDB();
    const po = await PurchaseOrder.findById(params.id)
      .populate('vendor')
      .populate('items.product');
    if (!po) {
      return NextResponse.json(
        { success: false, message: 'Purchase Order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: po });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/purchase-orders/:id
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Recalculate totals if items changed
    if (body.items && body.items.length > 0) {
      body.items = body.items.map(item => ({
        ...item,
        subtotal: item.quantity * item.unitPrice,
      }));
      body.subtotal = body.items.reduce((sum, item) => sum + item.subtotal, 0);
      body.total = body.subtotal + (body.tax || 0);
    }
    
    const po = await PurchaseOrder.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!po) {
      return NextResponse.json(
        { success: false, message: 'Purchase Order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: po });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/purchase-orders/:id
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const po = await PurchaseOrder.findByIdAndDelete(params.id);
    if (!po) {
      return NextResponse.json(
        { success: false, message: 'Purchase Order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Purchase Order deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
