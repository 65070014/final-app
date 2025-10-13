import { getDbPool } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id: patientId } = await params;
    const dbPool = getDbPool();
    let db = null;

    try {
        db = await dbPool.getConnection();
        const sql = `
        SELECT a.department,a.appointment_id,
        DATE_FORMAT(a.apdate, '%e %b %Y') AS date, 
        DATE_FORMAT(a.apdate, '%H:%i น.') AS time, 
        CONCAT( 
            CASE 
                WHEN m.position = 1 THEN (CASE WHEN m.gender = 1 THEN 'นพ. ' ELSE 'พญ. ' END) 
                ELSE (CASE WHEN m.gender = 1 THEN 'นาย ' ELSE 'นาง/น.ส. ' END) 
            END,
            m.fname, ' ', m.lname 
        ) AS doctorname,
        d.diag_name,
        CASE
            WHEN d.is_monitoring = FALSE THEN 'เสร็จสิ้น'
            WHEN d.is_monitoring = TRUE AND d.monitoring_end_date IS NULL THEN 'ติดตามอาการ'
            WHEN d.is_monitoring = TRUE AND d.monitoring_end_date >= CURDATE() THEN 'ติดตามอาการ'
            WHEN d.is_monitoring = TRUE AND d.monitoring_end_date < CURDATE() THEN 'เสร็จสิ้น'
        END AS status
        FROM Appointment a
        JOIN Diagnosis d on a.appointment_id = d.appointment_id
        JOIN Medical_Personnel m on a.medical_personnel_id = m.medical_personnel_id
        WHERE a.patient_id = ?
        AND a.status = 'Complete'
        `

        const [tests] = await db.query(sql,[patientId])
        return NextResponse.json(tests)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    } finally {
        if (db) {
            db.release();
        }
    }
}