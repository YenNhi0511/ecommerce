import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const user: any = await getUserFromRequest(req as any);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const doc = await User.findById(user._id).populate('wishlist').lean();
    return NextResponse.json({ wishlist: doc?.wishlist || [] });
  } catch (err: any) {
    console.error('wishlist GET error', err);
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const user: any = await getUserFromRequest(req as any);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { productId } = body;
    if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    const prod = await Product.findById(productId).lean();
    if (!prod) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    const updated = await User.findByIdAndUpdate(user._id, { $addToSet: { wishlist: productId } }, { new: true }).populate('wishlist').lean();
    return NextResponse.json({ wishlist: updated?.wishlist || [] });
  } catch (err: any) {
    console.error('wishlist POST error', err);
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const user: any = await getUserFromRequest(req as any);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    const updated = await User.findByIdAndUpdate(user._id, { $pull: { wishlist: productId } }, { new: true }).populate('wishlist').lean();
    return NextResponse.json({ wishlist: updated?.wishlist || [] });
  } catch (err: any) {
    console.error('wishlist DELETE error', err);
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 });
  }
}
