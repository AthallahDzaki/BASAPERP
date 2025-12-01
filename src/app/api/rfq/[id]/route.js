import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RFQ from '@/models/RFQ';

// GET /api/rfq/:id
export async function GET(request, { params }) {
  try {
    await connectDB();
    const rfq = await RFQ.findById(params.id)
      .populate('vendor')
      .populate('items.product');
    if (!rfq) {
      return NextResponse.json(
        { success: false, message: 'RFQ not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: rfq });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/rfq/:id
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const rfq = await RFQ.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!rfq) {
      return NextResponse.json(
        { success: false, message: 'RFQ not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: rfq });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/rfq/:id
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const rfq = await RFQ.findByIdAndDelete(params.id);
    if (!rfq) {
      return NextResponse.json(
        { success: false, message: 'RFQ not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'RFQ deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
