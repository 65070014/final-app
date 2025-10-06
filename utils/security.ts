
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key'; 
const TOKEN_EXPIRATION = '7d';

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
}

export function generateToken(payload: { id: number | string, role: string }): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: TOKEN_EXPIRATION,
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function verifyToken(token: string): any {
    try {
        return jwt.verify(token, JWT_SECRET);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return null;
    }
}
