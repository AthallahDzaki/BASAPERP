import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Customer } from '@/models';

// GET /api/customers
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const query = { isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query).sort({ name: 1 });
    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/customers
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const customer = await Customer.create(body);
    return NextResponse.json(
      { success: true, data: customer },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
