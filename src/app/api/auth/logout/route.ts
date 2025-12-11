import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('refreshToken='));
    const refreshToken = match ? match.split('=')[1] : null;
    if (!refreshToken) return NextResponse.json({ message: 'Logged out' });

    const user = await User.findOne({ refreshTokens: refreshToken });
    if (user) {
      user.refreshTokens = (user.refreshTokens || []).filter((t: string) => t !== refreshToken);
      await user.save();
    }

    const res = NextResponse.json({ message: 'Logged out' });
    // cast cookies to any to avoid NextResponse cookies typing differences between versions
    (res as any).cookies.delete('refreshToken', { path: '/' });
    return res;
  } catch (e) {
    console.error('Logout error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
