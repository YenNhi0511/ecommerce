import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const mine = searchParams.get('mine');

    const query: any = { isActive: true };

    // If requesting "mine=true", only return products createdBy the authenticated seller
    if (mine === 'true') {
      const user: any = await getUserFromRequest(request as any);
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      // sellers and admins allowed; other roles get forbidden
      if (!['seller', 'admin'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      query.createdBy = user._id;
    }

    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (search) query.$text = { $search: search };

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort({ [sort]: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Only sellers or admins may create products
    const user: any = await getUserFromRequest(request as any);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['seller', 'admin'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const product = new Product({ ...body, createdBy: user._id });
    await product.save();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}