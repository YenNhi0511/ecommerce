import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();
    
    const count = await Product.countDocuments({});
    const products = await Product.find({}).limit(10).select('name category price');
    
    return NextResponse.json({ 
      totalProducts: count,
      message: `Database hiện có ${count} products`,
      sampleProducts: products
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to check products' 
    }, { status: 500 });
  }
}
