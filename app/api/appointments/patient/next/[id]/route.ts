import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id: patientId } = await params;
    const dbPool = getDbPool(); 
    let db = null;

    try {
        db = await dbPool.getConnection(); 
        const [rows] = await db.query(

            `SELECT
                a.appointment_id AS id, 
                a.apdate,
                a.status,
                a.patient_status,
                CONCAT(p.fname, ' ', p.lname) AS patient,
                a.department, 
                CONCAT( 
                    CASE 
                        WHEN d.position = 1 THEN (CASE WHEN d.gender = 1 THEN 'นพ. ' ELSE 'พญ. ' END) 
                        ELSE (CASE WHEN d.gender = 1 THEN 'นาย ' ELSE 'นาง/น.ส. ' END) 
                    END,
                    d.fname, ' ', d.lname 
                ) AS doctorname,
                DATE_FORMAT(a.apdate, '%e %b %Y') AS date, 
                DATE_FORMAT(a.apdate, '%H:%i น.') AS time, 
                CASE 
                    WHEN COUNT(v.appointment_id) > 0 THEN 1 
                    ELSE 0 
                END AS is_vitals_filled
                FROM 
                    Appointment a 
                JOIN 
                    Patient p ON a.patient_id = p.patient_id 
                JOIN 
                    Medical_Personnel d ON a.medical_personnel_id = d.medical_personnel_id 
                LEFT JOIN 
                    Vital_Signs v ON a.appointment_id = v.appointment_id 
                WHERE 
                    a.patient_id = ?
                AND
                    a.status = 'Confirmed'
                OR
                    a.status = 'Pending'
                GROUP BY 
                    a.appointment_id, a.apdate, a.status, a.patient_status, 
                    p.fname, p.lname, a.department, d.position, d.gender, d.fname, d.lname
                ORDER BY
                    a.apdate ASC
                LIMIT 1`,
            [patientId]
        );
        console.log(rows)
        return NextResponse.json(rows);

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }finally {
        if (db) {
            db.release(); 
        }
    }
}