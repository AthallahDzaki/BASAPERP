import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Employee } from '@/models';

// GET /api/employees/[id] - Get employee by ID
export async function GET(request, { params }) {
  try {
    await connectDB();

    const employee = await Employee.findById(params.id)
      .populate('manager', 'firstName lastName employeeId position');

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/employees/[id] - Update employee
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const body = await request.json();

    // Check if new employee ID or email conflicts with other employees
    if (body.employeeId || body.email) {
      const existingEmployee = await Employee.findOne({
        _id: { $ne: params.id },
        $or: [
          body.employeeId ? { employeeId: body.employeeId } : {},
          body.email ? { email: body.email } : {}
        ].filter(obj => Object.keys(obj).length > 0)
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
    }

    const employee = await Employee.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).populate('manager', 'firstName lastName employeeId');

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    
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

// DELETE /api/employees/[id] - Delete employee (soft delete)
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    // Soft delete - just set isActive to false
    const employee = await Employee.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Employee deactivated successfully',
      data: employee,
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
