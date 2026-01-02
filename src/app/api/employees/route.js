import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Employee } from '@/models';

// GET /api/employees - Get all employees
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const isActive = searchParams.get('isActive');

    const query = {};

    if (search) {
      query.$or = [
        { employeeId: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) {
      query.department = department;
    }

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    const employees = await Employee.find(query)
      .populate('manager', 'firstName lastName employeeId')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/employees - Create new employee
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({ 
      $or: [
        { employeeId: body.employeeId },
        { email: body.email }
      ]
    });

    if (existingEmployee) {
      return NextResponse.json(
        { 
          success: false, 
          message: existingEmployee.employeeId === body.employeeId 
            ? 'Employee ID already exists' 
            : 'Email already exists'
        },
        { status: 400 }
      );
    }

    const employee = await Employee.create(body);

    return NextResponse.json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          success: false, 
          message: Object.values(error.errors).map(e => e.message).join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
