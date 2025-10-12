import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { ResultSetHeader } from 'mysql2/promise';

export async function POST(request: Request) {
    const dbPool = getDbPool();
    let db = null;

    try {
        const {
            patientId,
            medicalPersonnelId,
            medicationId,     
            drugName,        
            usage,
            quantity,
            note
        } = await request.json();

        if (!patientId || !medicalPersonnelId || (!medicationId && !drugName) || !quantity) {
            return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
        }

        db = await dbPool.getConnection();
        await db.beginTransaction(); 

        const finalMedicationId = medicationId;

        // 1. สร้างใบสั่งยา Prescription
        const prescriptionSql = `
            INSERT INTO Prescription (patient_id, medical_personnel_id, prescription_date, note)
            VALUES (?, ?, NOW(), ?)
        `;
        const [prescriptionResult] = await db.execute(prescriptionSql, [patientId, medicalPersonnelId, note || null]);
        const newPrescriptionId = (prescriptionResult as ResultSetHeader).insertId;
        
        // 2. บันทึกรายการยาลงในใบสั่งยา Prescription_Medication
        // โดยใช้ finalMedicationId ที่อาจจะมาจากยาเก่า หรือยาที่เพิ่งสร้างใหม่
        const presMedSql = `
            INSERT INTO Prescription_Medication (prescription_id, medication_id, dosage, quantity, note)
            VALUES (?, ?, ?, ?, ?)
        `;
        await db.execute(presMedSql, [newPrescriptionId, finalMedicationId, usage, quantity, note || null]);

        await db.commit(); 

        return NextResponse.json({
            message: 'บันทึกการจ่ายยาสำเร็จ',
            prescriptionId: newPrescriptionId
        }, { status: 201 });

    } catch (error) {
        if (db) {
            await db.rollback(); 
        }
        console.error("TRANSACTION FAILED:", error);
        return NextResponse.json({
            error: 'ไม่สามารถบันทึกข้อมูลได้',
            message: (error as Error).message
        }, { status: 500 });
    } finally {
        if (db) {
            db.release();
        }
    }
}