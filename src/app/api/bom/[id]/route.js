import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BOM from '@/models/BOM';

// GET /api/bom/:id
export async function GET(request, { params }) {
  try {
    await connectDB();
    const bom = await BOM.findById(params.id)
      .populate('product')
      .populate('components.component');
    if (!bom) {
      return NextResponse.json(
        { success: false, message: 'BOM not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: bom });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/bom/:id
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const bom = await BOM.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!bom) {
      return NextResponse.json(
        { success: false, message: 'BOM not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: bom });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/bom/:id
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const bom = await BOM.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );
    if (!bom) {
      return NextResponse.json(
        { success: false, message: 'BOM not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'BOM deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
