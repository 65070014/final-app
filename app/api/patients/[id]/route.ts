/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import { hashPassword } from '@/utils/security';
import { getDbPool } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: patientId } = await params;
    const dbPool = getDbPool();
    let db = null;

    if (!patientId) {
        return NextResponse.json({ error: 'ไม่พบรหัสผู้ป่วย' }, { status: 400 });
    }

    try {
        db = await dbPool.getConnection();

        const sql = `
            SELECT 
                p.fname AS firstName, 
                p.lname AS lastName, 
                p.gender, 
                p.cid AS id, 
                p.birth AS dob, 
                p.phone_number, 
                p.email, 
                p.abogroup AS bloodType, 
                p.nation, 
                p.occupation, 
                p.emergency_phone_number,
                
                m.weight, 
                m.height, 
                m.allergies AS drugallergy, 
                m.underlying_diseases AS underlying_disease,
                
                a.house_no AS houseno, 
                a.village, 
                a.road, 
                a.tambon, 
                a.ampur, 
                a.changwat
            FROM Patient p
            LEFT JOIN Medical_Record m ON p.patient_id = m.patient_id
            LEFT JOIN Address a ON m.medical_record_id = a.medical_record_id
            WHERE p.patient_id = ?
        `;

        const [rows]: any = await db.query(sql, [patientId]);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'ไม่พบข้อมูลผู้ป่วยในระบบ' }, { status: 404 });
        }

        const patientData = rows[0];
        if (patientData.dob) {
            const d = new Date(patientData.dob);
            patientData.dob = d.toISOString().split('T')[0]; 
        }

        return NextResponse.json(patientData, { status: 200 });

    } catch (error) {
        console.error("GET PATIENT FAILED:", error);
        return NextResponse.json({
            error: 'ไม่สามารถดึงข้อมูลผู้ป่วยได้',
            message: (error as Error).message
        }, { status: 500 });
    } finally {
        if (db) {
            db.release(); 
        }
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: patientId } = await params;

    const dbPool = getDbPool();
    let db = null;

    if (!patientId) {
        return NextResponse.json({ error: 'ไม่พบรหัสผู้ป่วย' }, { status: 400 });
    }

    try {
        const patientData = await request.json();
        console.log("Patient Data จาก Frontend:", patientData);
        db = await dbPool.getConnection();
        await db.query('START TRANSACTION'); 

        let sqlPatient = `
            UPDATE Patient SET 
                fname = ?, lname = ?, gender = ?, cid = ?, birth = ?, 
                phone_number = ?, email = ?, abogroup = ?, nation = ?, 
                occupation = ?, emergency_phone_number = ?
                WHERE patient_id = ?
        `;
        
        const patientValues: any[] = [
            patientData.firstName, patientData.lastName, patientData.gender, patientData.id, patientData.dob,
            patientData.phone_number, patientData.email, patientData.bloodType, patientData.nation,
            patientData.occupation, patientData.emergency_phone_number
        ];

        if (patientData.password && patientData.password.trim() !== '') {
            sqlPatient += `, password_hash = ?`;
            const hashedPassword = await hashPassword(patientData.password);
            patientValues.push(hashedPassword);
        }

        patientValues.push(patientId);

        await db.query(sqlPatient, patientValues);


        const sqlMedical = `
            UPDATE Medical_Record SET 
                weight = ?, height = ?, allergies = ?, underlying_diseases = ?
            WHERE patient_id = ?
        `;
        const medicalValues = [
            patientData.weight, patientData.height, patientData.drugallergy, patientData.underlying_disease,
            patientId
        ];
        
        await db.query(sqlMedical, medicalValues);


        const sqlAddress = `
            UPDATE Address a
            JOIN Medical_Record m ON a.medical_record_id = m.medical_record_id
            SET a.road = ?, a.tambon = ?, a.ampur = ?, a.changwat = ?, a.village = ?, a.house_no = ?
            WHERE m.patient_id = ?
        `;
        const addressValues = [
            patientData.road, patientData.tambon, patientData.ampur, patientData.changwat, patientData.village, patientData.houseno,
            patientId
        ];

        await db.query(sqlAddress, addressValues);
        await db.query('COMMIT'); 

        return NextResponse.json({
            message: 'อัปเดตข้อมูลผู้ป่วยสำเร็จ',
            patientId: patientId
        }, { status: 200 });

    } catch (error) {
        console.error("UPDATE TRANSACTION FAILED:", error);
        if (db) {
            await db.query('ROLLBACK'); 
            console.log("Transaction rolled back.");
        }

        return NextResponse.json({
            error: 'ไม่สามารถอัปเดตข้อมูลได้',
            message: (error as Error).message
        }, { status: 500 });
    } finally {
        if (db) {
            db.release(); 
        }
    }
}