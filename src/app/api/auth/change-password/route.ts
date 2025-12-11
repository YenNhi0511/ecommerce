import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Vui lòng cung cấp mật khẩu cũ và mật khẩu mới' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' }, { status: 400 });
    }

    await connectDB();

    const dbUser = await User.findById(user._id);
    if (!dbUser) {
      return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(oldPassword, dbUser.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Mật khẩu cũ không đúng' }, { status: 401 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    dbUser.password = hashed;
    await dbUser.save();

    return NextResponse.json({ message: 'Đổi mật khẩu thành công' }, { status: 200 });
  } catch (err) {
    console.error('Change password error:', err);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi đổi mật khẩu' }, { status: 500 });
  }
}
