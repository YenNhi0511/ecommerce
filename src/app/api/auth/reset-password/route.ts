import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email và newPassword là bắt buộc' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user and update password
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: newPassword },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Không tìm thấy user với email này' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Reset password thành công',
      email: user.email,
      name: user.name
    }, { status: 200 });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}
