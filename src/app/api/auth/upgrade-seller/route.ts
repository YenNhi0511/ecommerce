import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email là bắt buộc' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user and check current role
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Người dùng không tìm thấy' },
        { status: 404 }
      );
    }

    if (user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Chỉ tài khoản khách hàng mới có thể nâng cấp' },
        { status: 400 }
      );
    }

    // Update role to seller
    user.role = 'seller';
    await user.save();

    return NextResponse.json(
      { 
        message: 'Nâng cấp thành công! Bạn giờ là Seller',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upgrade seller error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi nâng cấp' },
      { status: 500 }
    );
  }
}
