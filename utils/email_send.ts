import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function createEmail(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    to: string,
    subject: string,
    message: string,
) {

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // 2. จัดเตรียมรูปแบบอีเมล
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to, // ส่งไปหาใคร
            subject: subject, // หัวข้ออีเมล
            html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2 style="color: #2e6c80;">🏥 ระบบ Telemedicine</h2>
              <p>${message}</p>
              <hr />
              <p style="font-size: 12px; color: #888;">นี่คืออีเมลอัตโนมัติ กรุณาอย่าตอบกลับ</p>
            </div>
          `,
        };

        // 3. สั่งส่งอีเมล
        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: 'ส่งอีเมลสำเร็จ!' });

    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { success: false, error: 'เกิดข้อผิดพลาดในการส่งอีเมล' },
            { status: 500 }
        );
    }
}