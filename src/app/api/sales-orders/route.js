import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SalesOrder from '@/models/SalesOrder';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Map client-side statuses if necessary (optional)
    if (body.status === 'draft') {
      // we accept 'draft' in schema, but if you prefer mapping to 'quotation', do it here:
      // body.status = 'quotation';
      // For now leave as-is because schema includes 'draft'.
    }

    // Normalize top-level fields (support client names)
    const discountType = body.discountType || (body.discount ? 'percentage' : 'percentage');
    const discountValue = Number(body.discountValue ?? body.discount ?? 0) || 0;
    const taxRate = Number(body.taxRate ?? body.tax ?? 0) || 0;

    if (Array.isArray(body.items) && body.items.length > 0) {
      // Normalize items and compute per-item totals
      body.items = body.items.map(itemRaw => {
        const item = { ...itemRaw };
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        const itemDiscountPct = Number(item.discount ?? 0) || 0;
        const itemTaxPct = Number(item.tax ?? 0) || 0;

        const base = quantity * unitPrice;
        const itemDiscountAmount = base * (itemDiscountPct / 100);
        const itemTaxAmount = (base - itemDiscountAmount) * (itemTaxPct / 100);
        const itemSubtotal = base - itemDiscountAmount + itemTaxAmount;

        return {
          ...item,
          quantity,
          unitPrice,
          discount: itemDiscountPct,
          tax: itemTaxPct,
          itemSubtotal: base,
          itemDiscountAmount,
          itemTaxAmount,
          subtotal: itemSubtotal
        };
      });

      // compute totals
      const itemsTotal = body.items.reduce((s, it) => s + (Number(it.subtotal) || 0), 0);

      let overallDiscountAmount = 0;
      if (discountType === 'percentage') {
        overallDiscountAmount = itemsTotal * (discountValue / 100);
      } else {
        overallDiscountAmount = discountValue;
      }

      const afterDiscount = itemsTotal - overallDiscountAmount;
      const overallTaxAmount = afterDiscount * (taxRate / 100);
      const grandTotal = afterDiscount + overallTaxAmount;

      body.subtotal = Number(itemsTotal) || 0;
      body.discountAmount = Number(overallDiscountAmount) || 0;
      body.taxAmount = Number(overallTaxAmount) || 0;
      body.total = Number(grandTotal) || 0;
      body.discountType = discountType;
      body.discountValue = discountValue;
      body.taxRate = taxRate;
    } else {
      // ensure defaults if no items
      body.items = [];
      body.subtotal = 0;
      body.discountAmount = 0;
      body.taxAmount = 0;
      body.total = 0;
    }

    const salesOrder = await SalesOrder.create(body);
    return NextResponse.json({ success: true, data: salesOrder }, { status: 201 });
  } catch (error) {
    console.error('POST /api/sales-orders error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const list = await SalesOrder.find().populate('customer').populate('items.product').sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: list }, { status: 200 });
  } catch (error) {
    console.error('GET /api/sales-orders error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}