import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Vendor } from '@/models';

// GET /api/vendors
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

    const vendors = await Vendor.find(query).sort({ name: 1 });
    return NextResponse.json({ success: true, data: vendors });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/vendors
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const vendor = await Vendor.create(body);
    return NextResponse.json(
      { success: true, data: vendor },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
