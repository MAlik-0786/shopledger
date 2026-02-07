import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export interface TokenPayload {
    id: string;
    email: string;
    role: 'merchant' | 'staff';
    merchantId?: string;
}

export function generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
        return null;
    }
}

export function getTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    const cookieToken = request.cookies.get('token')?.value;
    return cookieToken || null;
}

export function getUserFromRequest(request: NextRequest): TokenPayload | null {
    const token = getTokenFromRequest(request);
    if (!token) return null;
    return verifyToken(token);
}
