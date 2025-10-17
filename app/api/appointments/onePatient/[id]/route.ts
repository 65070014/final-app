import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET(request: Request, { params } : { params: Promise<{ id: string }> }) {
    const { id: appointment_id } = await params;
    const dbPool = getDbPool();
    let db = null;

    try {
        db = await dbPool.getConnection();
        const [rows] = await db.query(

            `SELECT
                TIMESTAMPDIFF(YEAR, birth, CURDATE()) AS age
                ,CONCAT(p.fname, ' ', p.lname) AS patient,
                p.patient_id,
                v.pr,
                v.rr,
                v.sbp,
                v.dbp,
                v.weight,
                v.temp,
                a.symptoms,
                md.allergies,
                md.underlying_diseases

                FROM 
                    Appointment a 
                JOIN 
                    Patient p ON a.patient_id = p.patient_id 
                JOIN 
                    Medical_Record md ON md.patient_id = p.patient_id
                LEFT JOIN 
                    Vital_Signs v ON a.appointment_id = v.appointment_id 
                WHERE 
                    a.appointment_id = ?`,
            [appointment_id]
        );
        console.log(rows)
        return NextResponse.json(rows);

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    } finally {
        if (db) {
            db.release();
        }
    }
}