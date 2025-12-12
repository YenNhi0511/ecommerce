import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from './mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export async function getUserFromRequest(request: NextRequest): Promise<any> {
  try {
    const auth = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!auth) {
      console.log('[Auth] No authorization header');
      return null;
    }
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log('[Auth] Invalid authorization format');
      return null;
    }
    const token = parts[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (!decoded?.userId) {
      console.log('[Auth] No userId in token');
      return null;
    }

    await connectDB();
    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      console.log('[Auth] User not found:', decoded.userId);
    }
    return user;
  } catch (err: any) {
    console.log('[Auth] Error:', err.message);
    return null;
  }
}

export async function requireAuth(request: NextRequest, roles: string[] = []): Promise<any | NextResponse> {
  const user: any = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (roles.length > 0 && !roles.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return user;
}
