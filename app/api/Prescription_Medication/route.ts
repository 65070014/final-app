import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { ResultSetHeader } from 'mysql2/promise';

export async function GET(){
    const dbPool = getDbPool(); 
    let db = null;

    try{
        db = await dbPool.getConnection(); 
        const sql = "SELECT * FROM Prescription"
        const [tests] = await db.query(sql)
        return NextResponse.json(tests)
    }catch(error){
        console.log(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }finally {
        if (db) {
            db.release(); 
        }
    }
}
export async function POST(request: Request) {
    const dbPool = getDbPool();
    let db = null;

    try {
        const data = await request.json();
        const {
            patientId,
            medicalPersonnelId,
            drugName,
            strength,
            usage,
            quantity
        } = data;

        // --- Validate input ---
        if (!patientId || !medicalPersonnelId || !drugName || !quantity) {
            return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
        }

        db = await dbPool.getConnection();
        await db.beginTransaction(); // --- START TRANSACTION ---

        // 1. สร้างใบสั่งยา (Prescription) หลักก่อน
        const prescriptionSql = `
            INSERT INTO Prescription (patient_id, medical_personnel_id, prescription_date)
            VALUES (?, ?, NOW())
        `;
        const [prescriptionResult] = await db.execute(prescriptionSql, [patientId, medicalPersonnelId]);
        const newPrescriptionId = (prescriptionResult as ResultSetHeader).insertId;

        
        const medicineFullName = strength ? `${drugName} ${strength}` : drugName;
        
        const medicationSql = `
            INSERT INTO Medication (medicine_name, quantity)
            VALUES (?,1)
            ON DUPLICATE KEY UPDATE medication_id=LAST_INSERT_ID(medication_id)
        `;
        //  ON DUPLICATE KEY UPDATE ใช้เพื่อป้องกันการ error หากมีชื่อยาซ้ำ และจะดึง ID ของยาที่มีอยู่แล้วมาใช้แทน ต้องปรับ LOGIC ใหม่
        
        const [medicationResult] = await db.execute(medicationSql, [medicineFullName]);
        const medicationId = (medicationResult as ResultSetHeader).insertId;
        
        // 3. บันทึกรายการยาลงในใบสั่งยา (Prescription_Medication)
        const presMedSql = `
            INSERT INTO Prescription_Medication (prescription_id, medication_id, dosage, quantity)
            VALUES (?, ?, ?, ?)
        `;
        await db.execute(presMedSql, [newPrescriptionId, medicationId, usage, quantity]);

        await db.commit(); // --- COMMIT TRANSACTION ---

        return NextResponse.json({
            message: 'บันทึกการจ่ายยาสำเร็จ',
            prescriptionId: newPrescriptionId
        }, { status: 201 });

    } catch (error) {
        console.error("TRANSACTION FAILED:", error);
        if (db) {
            await db.rollback(); // --- ROLLBACK TRANSACTION ON ERROR ---
        }
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
