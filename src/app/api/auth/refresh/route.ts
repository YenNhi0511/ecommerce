import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('refreshToken='));
    const refreshToken = match ? match.split('=')[1] : null;
    if (!refreshToken) return NextResponse.json({ error: 'No refresh token' }, { status: 401 });

    const user = await User.findOne({ refreshTokens: refreshToken });
    if (!user) return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });

    // rotate refresh token
    const newRefresh = crypto.randomBytes(48).toString('hex');
    user.refreshTokens = (user.refreshTokens || []).filter((t: string) => t !== refreshToken);
    user.refreshTokens.push(newRefresh);
    await user.save();

    const accessToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
    const res = NextResponse.json({ token: accessToken, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    res.cookies.set('refreshToken', newRefresh, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 30, secure: process.env.NODE_ENV === 'production' });
    return res;
  } catch (e) {
    console.error('Refresh error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
