import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Employee from '@/models/Employee';

// GET /api/employees/generate-id - Generate next employee ID
export async function GET() {
  try {
    await connectDB();

    // Find the latest employee by employeeId
    const latestEmployee = await Employee.findOne()
      .sort({ employeeId: -1 })
      .limit(1);

    let nextId = 'EMP001';

    if (latestEmployee && latestEmployee.employeeId) {
      // Extract number from last employee ID (e.g., "EMP001" -> 1)
      const match = latestEmployee.employeeId.match(/EMP(\d+)/);
      if (match) {
        const lastNumber = parseInt(match[1], 10);
        const nextNumber = lastNumber + 1;
        nextId = `EMP${String(nextNumber).padStart(3, '0')}`;
      }
    }

    return NextResponse.json({
      success: true,
      data: { nextId },
    });
  } catch (error) {
    console.error('Error generating employee ID:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
