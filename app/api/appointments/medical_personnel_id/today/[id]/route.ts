import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id: doctorId } = await params;
    let db;
    const dbPool = getDbPool();
    try {
        db = await dbPool.getConnection();

        const [rows] = await db.query(
            `SELECT 
                a.appointment_id AS id,
                a.patient_status,
                DATE_FORMAT(a.apdate, '%e %b %Y') AS date,
                DATE_FORMAT(a.apdate, '%H:%i น.') AS time,
                a.department,
                a.symptoms,
                CONCAT(
                    CASE 
                        WHEN p.gender = 1 THEN 'นาย ' 
                        ELSE 'นาง/น.ส. ' 
                    END,
                    p.fname, ' ', p.lname
                ) AS patient
            FROM Appointment a
            JOIN Patient p ON a.patient_id = p.patient_id
            WHERE a.medical_personnel_id = ?
            AND DATE(a.apdate) >= DATE_ADD(CURDATE(), INTERVAL 7 HOUR) 
            AND DATE(a.apdate) < DATE_ADD(CURDATE(), INTERVAL 31 HOUR)
            GROUP BY 
                a.appointment_id, a.status, a.patient_status, a.department,
                p.fname, p.lname, p.gender,a.apdate
            ORDER BY a.apdate ASC;`,
            [doctorId]
        );

        return NextResponse.json(rows);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
