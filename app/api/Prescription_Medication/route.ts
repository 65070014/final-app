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
            appointmentId,
            medicationId,
            drugName,
            dosage,
            duration,
            usage,
            quantity,
            note
        } = await request.json();

        // --- Validate input ---
        if (!patientId || !medicalPersonnelId || !appointmentId || (!medicationId && !drugName) || !quantity) {
            return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
        }

        db = await dbPool.getConnection();
        await db.beginTransaction();

        let finalMedicationId = medicationId;
        if (!finalMedicationId && drugName) {
            const medicationSql = `INSERT INTO Medication (medicine_name) VALUES (?)`;
            const [medicationResult] = await db.execute(medicationSql, [drugName]);
            finalMedicationId = (medicationResult as ResultSetHeader).insertId;
        }

        // 1. สร้างใบสั่งยา Prescription และ appointment_id
        const prescriptionSql = `
            INSERT INTO Prescription (patient_id, medical_personnel_id, appointment_id, prescription_date, note)
            VALUES (?, ?, ?, NOW(), ?)
        `;
        const [prescriptionResult] = await db.execute(prescriptionSql, [patientId, medicalPersonnelId, appointmentId, note || null]);
        const newPrescriptionId = (prescriptionResult as ResultSetHeader).insertId;

        // 2. บันทึกรายการยาลงในใบสั่งยา Prescription_Medication
        const presMedSql = `
            INSERT INTO Prescription_Medication (prescription_id, medication_id, dosage, \`usage\`, duration, quantity, note)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const dosageNumber = parseFloat(dosage); // แปลง string เป็นตัวเลข เช่น "1 เม็ด" → 1
        const frequency = parseInt(usage.replace(/\D/g, "")) || 1; // ดึงตัวเลขจาก "วันละ 3 ครั้ง" → 3
        const totalQuantity = dosageNumber * frequency * duration;

        await db.execute(presMedSql, [
            newPrescriptionId,
            finalMedicationId,
            dosage || null,
            usage || null,
            duration || null,
            totalQuantity,
            note || null,
        ]);

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