import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id: doctorId } = params;
    let db;
    const dbPool = getDbPool(); 
    try {
        db = await dbPool.getConnection();

        const [rows] = await db.query(
            `SELECT 
                a.appointment_id AS id,
                a.apdate,
                a.status,
                a.patient_status,
                DATE_FORMAT(a.apdate, '%e %b %Y') AS date,
                DATE_FORMAT(a.apdate, '%H:%i น.') AS time,
                a.department,
                CONCAT(
                    CASE 
                        WHEN p.gender = 1 THEN 'นาย ' 
                        ELSE 'นาง/น.ส. ' 
                    END,
                    p.fname, ' ', p.lname
                ) AS patient,
                CONCAT(
                    CASE 
                        WHEN d.position = 1 THEN (CASE WHEN d.gender = 1 THEN 'นพ. ' ELSE 'พญ. ' END)
                        ELSE (CASE WHEN d.gender = 1 THEN 'นาย ' ELSE 'นาง/น.ส. ' END)
                    END,
                    d.fname, ' ', d.lname
                ) AS doctorname,
                CASE 
                    WHEN COUNT(v.appointment_id) > 0 THEN 1
                    ELSE 0
                END AS is_vitals_filled
            FROM Appointment a
            JOIN Patient p ON a.patient_id = p.patient_id
            JOIN Medical_Personnel d ON a.medical_personnel_id = d.medical_personnel_id
            LEFT JOIN Vital_Signs v ON a.appointment_id = v.appointment_id
            WHERE a.medical_personnel_id = ?
            GROUP BY 
                a.appointment_id, a.apdate, a.status, a.patient_status, a.department,
                p.fname, p.lname, p.gender, d.position, d.gender, d.fname, d.lname
            ORDER BY a.apdate ASC;`,
            [doctorId]
        );

        return NextResponse.json(rows);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
