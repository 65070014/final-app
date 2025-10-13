import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET() {
    const dbPool = getDbPool(); 
    let db = null;
    try {
        db = await dbPool.getConnection(); 

        const sql = `
            SELECT 
                a.appointment_id AS id, 
                a.patient_id,
                a.medical_personnel_id,
                CONCAT(p.fname, ' ', p.lname) AS patient,
                DATE_FORMAT(a.apdate, '%e %b %Y') AS date, 
                DATE_FORMAT(a.apdate, '%H:%i น.') AS time, 
                a.department, 
                CONCAT(
                    CASE 
                        WHEN d.position = 1 THEN (CASE WHEN d.gender = 1 THEN 'นพ. ' ELSE 'พญ. ' END) 
                        ELSE (CASE WHEN d.gender = 1 THEN 'นาย ' ELSE 'นาง/น.ส. ' END) 
                    END,
                    d.fname, ' ', d.lname
                ) AS doctorname,
                a.status, 
                a.patient_status,
                CASE WHEN pr.prescription_id IS NOT NULL THEN 1 ELSE 0 END AS is_prescribed
            FROM 
                Appointment a 
            JOIN 
                Patient p ON a.patient_id = p.patient_id 
            JOIN 
                Medical_Personnel d ON a.medical_personnel_id = d.medical_personnel_id
            LEFT JOIN 
                Prescription pr ON a.appointment_id = pr.appointment_id
            WHERE 
                a.status = 'Complete'
            ORDER BY 
                a.apdate ASC
        `;
        
        const [rows] = await db.query(sql);
        return NextResponse.json(rows);

    } catch (error) {
        console.log("Failed to fetch appointments:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    } finally {
        if (db) {
            db.release(); 
        }
    }
}

