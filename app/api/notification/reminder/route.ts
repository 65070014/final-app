/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from 'next/server';
import { getDbPool } from '@/lib/db';
import { createNotification } from '@/utils/notification';
import { createEmail } from '@/utils/email_send';

export async function GET(request: NextRequest) {
    // 🔒 ดักรหัสผ่าน (เหมือนเดิม)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer TelemedSecret888`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbPool = getDbPool();
    let db = null;

    try {
        db = await dbPool.getConnection();

        // ภารกิจที่ 1: แจ้งเตือนเข้าห้อง (ล่วงหน้า 30 นาที)
        const sqlRoom = `
            SELECT a.appointment_id, a.apdate, p.email, p.first_name 
            FROM Appointment a
            JOIN Patient p ON a.patient_id = p.patient_id
            WHERE a.status = 'Confirmed' 
            AND a.is_room_reminded = 0 
            AND a.apdate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 MINUTE)
        `;
        const [roomAppts] = await db.query(sqlRoom) as any[];

        for (const appt of roomAppts) {
            await createNotification(
                db,
                appt.patientId,
                'Patient',
                'APPOINTMENT_REMINDER',
                'นัดหมายของคุณใกล้ถึงเวลาแล้วโปรดเตรียมตัวพบแพทย์',
                `/patient/videocall/${appt.meeting_id}`
            );

            await createEmail(
                appt.email,
                "🏥 แจ้งเตือนการเข้าพบแพทย์ (Telemedicine)",
                `นัดหมายของคุณใกล้ถึงเวลาแล้วโปรดเตรียมตัวพบแพทย์`
            );

            await db.query(`UPDATE Appointment SET is_room_reminded = 1 WHERE appointment_id = ?`, [appt.appointment_id]);
        }

        // ==========================================
        // ภารกิจที่ 2: แจ้งเตือนกรอกข้อมูลสุขภาพ (ล่วงหน้า 3 วัน)
        // ==========================================
        // 💡 สมมติว่าเราเช็คจากตาราง Patient ว่ายังไม่มีข้อมูลน้ำหนักส่วนสูง (หรือคุณมีตาราง HealthRecord ก็ Join เอาได้ครับ)
        const sqlHealth = `
            SELECT a.appointment_id, a.apdate, p.email, p.first_name 
            FROM Appointment a
            JOIN Patient p ON a.patient_id = p.patient_id
            WHERE a.status = 'Confirmed' 
            AND a.is_health_reminded = 0 
            AND a.apdate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 3 DAY) 
            AND (p.weight IS NULL OR p.height IS NULL) -- << เปลี่ยนเงื่อนไขตรงนี้ให้ตรงกับ Database ของคุณที่ใช้เช็คว่ากรอกรึยัง
        `;
        const [healthAppts] = await db.query(sqlHealth) as any[];

        for (let appt of healthAppts) {
            await createNotification(
                db,
                appt.patientId,
                'Patient',
                'VITAL_SIGNS_REMINDER',
                'คุณยังไม่ได้กรอกข้อมูลสัญญาณชีพ โปรดกรอกให้เรียบร้อยก่อนพบแพทย์',
                `/patient/appointments?selected=${appt.appointment_id}`
            );

            await createEmail(
                appt.email,
                "🏥 แจ้งเตือนการกรอกข้อมูล (Telemedicine)",
                `คุณยังไม่ได้กรอกข้อมูลสัญญาณชีพ โปรดกรอกให้เรียบร้อยก่อนพบแพทย์`
            );

            await db.query(`UPDATE Appointment SET is_health_reminded = 1 WHERE appointment_id = ?`, [appt.appointment_id]);
        }

        return NextResponse.json({
            success: true,
            message: `ส่งเตือนเข้าห้อง: ${roomAppts.length} คิว | ส่งเตือนกรอกข้อมูล: ${healthAppts.length} คิว`
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    } finally {
        if (db) db.release();
    }
}