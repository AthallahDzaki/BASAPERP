import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Quotation } from '@/models';

// GET /api/quotations/:id
export async function GET(request, { params }) {
  try {
    await connectDB();
    const quotation = await Quotation.findById(params.id)
      .populate('customer')
      .populate('items.product');
    if (!quotation) {
      return NextResponse.json(
        { success: false, message: 'Quotation not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: quotation });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/quotations/:id
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
    
    const quotation = await Quotation.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!quotation) {
      return NextResponse.json(
        { success: false, message: 'Quotation not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: quotation });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/quotations/:id
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const quotation = await Quotation.findByIdAndDelete(params.id);
    if (!quotation) {
      return NextResponse.json(
        { success: false, message: 'Quotation not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Quotation deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
