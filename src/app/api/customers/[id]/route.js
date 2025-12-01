import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';

// GET /api/customers/:id
export async function GET(request, { params }) {
  try {
    await connectDB();
    const customer = await Customer.findById(params.id);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/customers/:id
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const customer = await Customer.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/customers/:id
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const customer = await Customer.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
