import { getDbPool } from '@/lib/db'
import { NextResponse } from 'next/server'
import { RowDataPacket } from 'mysql2/promise';

interface ItemDetailFromDB {
    prescription_id: string;
    medication_id: string;
    medicine_name: string;
    dosage: string;
    quantity: number;
    usage: string;
    note: string;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id: patientId } = await params;
    const dbPool = getDbPool();
    let db = null;

    try {
        db = await dbPool.getConnection();
        const sql = `
        SELECT p.prescription_id,
        DATE_FORMAT(a.apdate, '%e %b %Y') AS appointment_date,
        CONCAT( 
            CASE 
                WHEN m.position = 1 THEN (CASE WHEN m.gender = 1 THEN 'นพ. ' ELSE 'พญ. ' END) 
                ELSE (CASE WHEN m.gender = 1 THEN 'นาย ' ELSE 'นาง/น.ส. ' END) 
            END,
            m.fname, ' ', m.lname 
        ) AS doctor_name
        FROM Appointment a
        JOIN Medical_Personnel m on a.medical_personnel_id = m.medical_personnel_id
        JOIN Prescription p on a.appointment_id = p.appointment_id
        WHERE p.patient_id = ?
        ORDER BY a.apdate DESC`;

        const [mainRecords] = await db.query<RowDataPacket[]>(sql, [patientId])

        const prescriptionIds = mainRecords.map(record => record.prescription_id);

        const sqlItems = `
        SELECT
            pm.prescription_id,
            m.medicine_name, 
            pm.dosage, 
            pm.quantity, 
            pm.usage, 
            pm.note
        FROM 
            Prescription_Medication pm
        JOIN 
            Medication m ON pm.medication_id = m.medication_id
        WHERE 
            pm.prescription_id IN (?)`;

        const [fetchedItems] = await db.query(sqlItems, [prescriptionIds]);
        const items: ItemDetailFromDB[] = Array.isArray(fetchedItems)
            ? (fetchedItems as ItemDetailFromDB[])
            : [];

        const finalHistory = mainRecords.map(record => {
            const relatedItems = items.filter(item => item.prescription_id === record.prescription_id);
            return {
                ...record,
                items: relatedItems
            };
        });

        console.log(finalHistory)

        return NextResponse.json(finalHistory)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    } finally {
        if (db) {
            db.release();
        }
    }
}