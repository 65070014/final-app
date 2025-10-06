/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { comparePassword } from '@/utils/security';
import { createConnection } from './db';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials) return null;

                try {
                    const db = await createConnection();

                    // 1. ค้นหาผู้ใช้ในตาราง patients
                    const [rows] = await db.execute(
                        `SELECT patient_id, email, fname, lname, password_hash FROM Patient WHERE email = ?`,
                        [credentials.email]
                    );
                    const user = (rows as any)[0];

                    if (!user) return null; // ไม่พบผู้ใช้

                    const isValid = await comparePassword(credentials.password, user.password_hash);

                    if (isValid) {
                        return {
                            id: user.patient_id.toString(), // NextAuth ต้องการ String
                            name: `${user.fname} ${user.lname}`,
                            email: user.email,
                            role: 'patient'
                        };
                    }
                    return null; // รหัสผ่านไม่ถูกต้อง

                } catch (error) {
                    console.error("NextAuth Authorize Error:", error);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt", // ใช้ JWT ในการจัดการ Session (ดีที่สุดสำหรับ Next.js)
        maxAge: 30 * 24 * 60 * 60, // 30 วัน
    },
    // 3. กำหนด Callback (เพื่อเพิ่มข้อมูล user ID ลงใน Session/JWT)
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
    // 4. ตั้งค่าหน้า Login ที่กำหนดเอง
    pages: {
        signIn: '/patient/login',
    }
};