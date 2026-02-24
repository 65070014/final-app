/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from 'next/server';
import { getDbPool } from '@/lib/db';
import { createNotification } from '@/utils/notification';
import { createEmail } from '@/utils/email_send';

export async function GET(request: NextRequest) {
    //กันการเข้าผ่าน URLs
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer TelemedSecret888`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbPool = getDbPool();
    let db = null;

    try {
        db = await dbPool.getConnection();

        //แจ้งเตือนเข้าห้อง (ล่วงหน้า 30 นาที)
        const sqlRoom = `
            SELECT a.appointment_id, a.apdate, p.email, p.patient_id
            FROM Appointment a
            JOIN Patient p ON a.patient_id = p.patient_id
            WHERE a.status = 'Confirmed' 
            AND a.is_room_reminded = 0 
            AND a.apdate BETWEEN DATE_ADD(NOW(), INTERVAL 7 HOUR) 
                 AND DATE_ADD(NOW(), INTERVAL 450 MINUTE)
        `;
        const [roomAppts] = await db.query(sqlRoom) as any[];
        for (const appt of roomAppts) {

            await createNotification(
                db,
                appt.patient_id,
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

        //แจ้งเตือนกรอกข้อมูลสุขภาพ (ล่วงหน้า 3 วัน)
        const sqlHealth = `
            SELECT a.appointment_id, a.apdate, p.email,p.patient_id
            FROM Appointment a
            JOIN Patient p ON a.patient_id = p.patient_id
            LEFT JOIN Vital_Signs v ON a.appointment_id = v.appointment_id 
            WHERE a.status = 'Confirmed' 
            AND a.is_health_reminded = 0 
            AND a.apdate BETWEEN DATE_ADD(NOW(), INTERVAL 7 HOUR) 
            AND DATE_ADD(NOW(), INTERVAL 79 HOUR)
            AND v.appointment_id IS NULL
        `;
        const [healthAppts] = await db.query(sqlHealth) as any[];
        for (const appt of healthAppts) {
            await createNotification(
                db,
                appt.patient_id,
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