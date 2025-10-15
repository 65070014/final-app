import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db'

export async function GET(request: Request) {
    const dbPool = getDbPool();
    let db = null;

    try {
        const { searchParams } = new URL(request.url);
        const doctor_id = searchParams.get('doctor_id');

        db = await dbPool.getConnection();

        const sql = `
            SELECT 
                p.patient_id as id,a.appointment_id as app_id, d.diagnosis_id as diag_id,
                CONCAT(
                    CASE 
                        WHEN p.gender = 1 THEN 'นาย ' 
                        ELSE 'นาง/น.ส. ' 
                    END,
                        p.fname, ' ', p.lname
                    ) AS name,
                TIMESTAMPDIFF(YEAR, birth, CURDATE()) AS age, 
                mr.underlying_diseases as chronicConditions, 
                mr.allergies,
                d.diag_name,
                DATE(a.apdate) AS monitoringStartDate,
                d.monitoring_end_date as monitoringEndDate
            FROM 
                Appointment a
            JOIN Diagnosis d on a.appointment_id = d.appointment_id
            JOIN Patient p on a.patient_id = p.patient_id
            JOIN Medical_Record mr on a.patient_id = mr.patient_id
            WHERE a.medical_personnel_id = ?
            AND d.is_monitoring = TRUE
        `;

        const [rows] = await db.query(sql, [doctor_id]);

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching vital signs history:", error);
        return NextResponse.json(
            { error: (error as Error).message || "An unexpected error occurred" },
            { status: 500 }
        );
    } finally {
        if (db) {
            db.release();
        }
    }
}