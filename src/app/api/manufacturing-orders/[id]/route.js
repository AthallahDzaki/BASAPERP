import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ManufacturingOrder } from '@/models';

// GET /api/manufacturing-orders/:id
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const mo = await ManufacturingOrder.findById(id)
      .populate('product')
      .populate('bom');
    if (!mo) {
      return NextResponse.json(
        { success: false, message: 'Manufacturing Order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: mo });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/manufacturing-orders/:id
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const mo = await ManufacturingOrder.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!mo) {
      return NextResponse.json(
        { success: false, message: 'Manufacturing Order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: mo });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/manufacturing-orders/:id
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const mo = await ManufacturingOrder.findByIdAndDelete(id);
    if (!mo) {
      return NextResponse.json(
        { success: false, message: 'Manufacturing Order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Manufacturing Order deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
