// app/api/register-patient/route.ts

import { NextResponse } from 'next/server';
import { hashPassword } from '@/utils/security';
import { createConnection } from '@/lib/db'

export async function POST(request: Request) {
    let db;
    try {
        const patientData = await request.json(); // รับ Object formData ทั้งก้อน
        const hashedPassword = await hashPassword(patientData.password);

        const patientvalues = [
            patientData.firstName,
            patientData.lastName,
            patientData.gender,
            patientData.id,
            patientData.dob,
            patientData.phone_number,
            patientData.email,
            hashedPassword,
            patientData.bloodType,
            patientData.nation,
            patientData.occupation,
            patientData.emergency_phone_number
        ];


        db = await createConnection();
        await db.execute('START TRANSACTION'); 

        const sqlPrimary = `
            INSERT INTO Patient (
                fname, lname, gender, cid, birth, 
                phone_number, email, password_hash, abogroup,nation,occupation,emergency_phone_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [resultPrimary] = await db.execute(sqlPrimary, patientvalues);
        const patientId = resultPrimary.insertId;

        const medicalvalues = [
            patientData.weight,
            patientData.height,
            patientData.drugallergy,
            patientData.underlying_disease,
            patientId
        ];

        const sqlMedical = `
            INSERT INTO Medical_Record (
                weight, height, allergies, underlying_diseases,patient_id
            ) VALUES (?, ?, ?, ?,?)
        `;

        const [resultMedical] = await db.execute(sqlMedical, medicalvalues);
        const MedicalId = resultMedical.insertId;

        const addressvalues = [
            patientData.road,
            patientData.tambon,
            patientData.ampur,
            patientData.changwat,
            patientData.village,
            patientData.houseno,
            MedicalId
        ];

        const sqlAddress = `
            INSERT INTO Address (
                road, tambon, ampur, changwat,village, house_no,medical_record_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await db.execute(sqlAddress, addressvalues);
        await db.execute('COMMIT'); 


        return NextResponse.json({
            message: 'ลงทะเบียนสำเร็จ',
            insertId: patientId
        }, { status: 201 });

    } catch (error) {
        console.error("TRANSACTION FAILED:", error);
        if (db) {
            await db.execute('ROLLBACK'); 
            console.log("Transaction rolled back.");
        }

        return NextResponse.json({
            error: 'ไม่สามารถบันทึกข้อมูลได้',
            message: (error as Error).message
        }, { status: 500 });
    }
}