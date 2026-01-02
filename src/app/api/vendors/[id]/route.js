import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Vendor } from '@/models';

// GET /api/vendors/:id
export async function GET(request, { params }) {
  try {
    await connectDB();
    const vendor = await Vendor.findById(params.id);
    if (!vendor) {
      return NextResponse.json(
        { success: false, message: 'Vendor not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: vendor });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/vendors/:id
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const vendor = await Vendor.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!vendor) {
      return NextResponse.json(
        { success: false, message: 'Vendor not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: vendor });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/vendors/:id
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const vendor = await Vendor.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );
    if (!vendor) {
      return NextResponse.json(
        { success: false, message: 'Vendor not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Vendor deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
