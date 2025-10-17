import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { format } from "date-fns";
import { th } from "date-fns/locale";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: appointment_id } = await params;
    const dbPool = getDbPool();
    let db = null;
    try {
        db = await dbPool.getConnection();

        const sql = `
            SELECT 
                CONCAT(p.fname, ' ', p.lname) AS patient_name,
                a.apdate,
                m.medicine_name AS name,
                pm.usage,
                pm.quantity,
                CONCAT(mp.fname, ' ', mp.lname) AS doctor_name
            FROM Appointment a
            JOIN Patient p ON a.patient_id = p.patient_id
            LEFT JOIN Prescription pres ON a.appointment_id = pres.appointment_id
            LEFT JOIN Prescription_Medication pm ON pres.prescription_id = pm.prescription_id
            LEFT JOIN Medication m ON pm.medication_id = m.medication_id
            JOIN Medical_Personnel mp ON a.medical_personnel_id = mp.medical_personnel_id
            WHERE pres.appointment_id = ?;
        `;

        const [rows] = await db.query(sql, [appointment_id]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results = rows as any[];

        if (results.length === 0) {
            return NextResponse.json({ error: "ไม่พบข้อมูลใบสั่งยาสำหรับการนัดหมายนี้" }, { status: 404 });
        }

        const firstRow = results[0];
        const prescriptionData = {
            patient_name: firstRow.patient_name,
            date: format(new Date(firstRow.apdate), "dd MMMM yyyy", { locale: th }),
            doctor_name: firstRow.doctor_name,
            medicines: results.map(row => ({
                name: row.name,
                usage: row.usage,
                quantity: row.quantity
            })).filter(med => med.name)
        };

        return NextResponse.json(prescriptionData);

    } catch (error) {
        console.error(`Failed to fetch prescription for appointment ${appointment_id}:`, error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    } finally {
        if (db) {
            db.release();
        }
    }
}
