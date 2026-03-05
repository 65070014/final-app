import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    const dbPool = getDbPool();
    let db = null;

    try {
        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');

        if (!patientId) {
            return NextResponse.json({ error: 'Missing patientId' }, { status: 400 });
        }

        db = await dbPool.getConnection();

        // 👨‍⚕️ ดึงเฉพาะคำแนะนำล่าสุดจาก Monitoring_Log
        const sqlAdvice = `
            SELECT 
                ml.analysis_plan_note as doctor_advice,
                ml.log_datetime as advice_date
            FROM test.Monitoring_Log ml
            JOIN test.Diagnosis d ON ml.diagnosis_id = d.diagnosis_id
            JOIN test.Appointment a ON d.appointment_id = a.appointment_id
            WHERE a.patient_id = ?
            ORDER BY ml.log_datetime DESC 
            LIMIT 3;
        `;

        const [rows] = await db.query(sqlAdvice, [patientId]);
        const adviceRows = rows as RowDataPacket[];
        return NextResponse.json(adviceRows);


    } catch (error) {
        console.error("Error fetching doctor advice:", error);
        return NextResponse.json({ error: "Failed to fetch doctor advice" }, { status: 500 });
    } finally {
        if (db) db.release();
    }
}