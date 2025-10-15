/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { comparePassword } from '@/utils/security';
import { getDbPool } from './db';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                let db = null;
                if (!credentials) return null;

                try {
                    const dbPool = getDbPool(); 
                    db = await dbPool.getConnection();

                    const [rows] = await db.execute(
                        `SELECT patient_id, email, fname, lname, password_hash FROM Patient WHERE email = ?`,
                        [credentials.email]
                    );
                    const user = (rows as any)[0];

                    if (!user) return null;

                    const isValid = await comparePassword(credentials.password, user.password_hash);

                    if (isValid) {
                        return {
                            id: user.patient_id.toString(),
                            name: `${user.fname} ${user.lname}`,
                            email: user.email,
                            role: 'patient'
                        };
                    }
                    return null;

                } catch (error) {
                    console.error("NextAuth Authorize Error:", error);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },

    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        session: async ({ session, token }) => {
            (session.user as any).id = token.id;
            (session.user as any).role = token.role;
            return session;
        }
    },
    
    secret: process.env.NEXTAUTH_SECRET,

    pages: {
        signIn: '/patient/login',
    }
};