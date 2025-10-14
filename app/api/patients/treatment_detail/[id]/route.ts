import { getDbPool } from '@/lib/db'
import { RowDataPacket } from 'mysql2/promise';
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id: appointmentId } = await params;
    const dbPool = getDbPool();
    let db = null;

    try {
        db = await dbPool.getConnection();
        const sql = `
        SELECT a.appointment_id,d.note as diag_note ,d.diag_code,
        DATE_FORMAT(a.apdate, '%e %b %Y') AS date, 
        DATE_FORMAT(a.apdate, '%H:%i น.') AS time, 
        CONCAT( 
            CASE 
                WHEN m.position = 1 THEN (CASE WHEN m.gender = 1 THEN 'นพ. ' ELSE 'พญ. ' END) 
                ELSE (CASE WHEN m.gender = 1 THEN 'นาย ' ELSE 'นาง/น.ส. ' END) 
            END,
            m.fname, ' ', m.lname 
        ) AS doctorname,
        CONCAT(
            CASE 
                WHEN p.gender = 1 THEN 'นาย ' 
                ELSE 'นาง/น.ส. ' 
            END,
            p.fname, ' ', p.lname
        ) AS patient,
        d.diag_name,
        CASE
            WHEN d.is_monitoring = FALSE THEN 'เสร็จสิ้น'
            WHEN d.is_monitoring = TRUE AND d.monitoring_end_date IS NULL THEN 'ติดตามอาการ'
            WHEN d.is_monitoring = TRUE AND d.monitoring_end_date >= CURDATE() THEN 'ติดตามอาการ'
            WHEN d.is_monitoring = TRUE AND d.monitoring_end_date < CURDATE() THEN 'เสร็จสิ้น'
        END AS monitoringStatus
        FROM Appointment a
        JOIN Diagnosis d on a.appointment_id = d.appointment_id
        JOIN Medical_Personnel m on a.medical_personnel_id = m.medical_personnel_id
        JOIN Patient p on a.patient_id = p.patient_id
        WHERE a.appointment_id = ?
        `

        const [mainRecords] = await db.query<RowDataPacket[]>(sql, [appointmentId])
        const mainRecord = mainRecords[0];


        const detailSql = `
        SELECT m.medicine_name, pm.dosage, pm.quantity, pm.usage, pm.note
        FROM Prescription p
        JOIN Prescription_Medication pm on p.prescription_id = pm.prescription_id
        JOIN Medication m on pm.medication_id = m.medication_id
        WHERE 
            p.appointment_id = ?
    `;

        const [medicationDetails] = await db.query(detailSql, [appointmentId]);

        const finalResult = {
            ...mainRecord,
            medications: medicationDetails
        };

        console.log(finalResult)

        return NextResponse.json(finalResult)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    } finally {
        if (db) {
            db.release();
        }
    }
}