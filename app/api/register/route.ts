// app/api/register-patient/route.ts

import { NextResponse } from 'next/server';
import { hashPassword } from '@/utils/security';
import { getDbPool } from '@/lib/db'
import { ResultSetHeader } from 'mysql2/promise';

export async function POST(request: Request) {
    const dbPool = getDbPool(); 
    let db = null;

    try {
        const patientData = await request.json();
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


        db = await dbPool.getConnection();
        await db.execute('START TRANSACTION'); 

        const sqlPrimary = `
            INSERT INTO Patient (
                fname, lname, gender, cid, birth, 
                phone_number, email, password_hash, abogroup,nation,occupation,emergency_phone_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [resultPrimary] = await db.execute(sqlPrimary, patientvalues);
        const resultHeader = resultPrimary as ResultSetHeader; 
        const patientId = resultHeader.insertId;

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
        const resultHeader2 = resultMedical as ResultSetHeader; 
        const MedicalId = resultHeader2.insertId;

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
    }finally {
        if (db) {
            db.release(); 
        }
    }
}