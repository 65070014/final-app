// app/api/register-patient/route.ts

import { NextResponse } from 'next/server';
import { createConnection } from '@/lib/db'

export async function GET() {
    let db;
    try {
        db = await createConnection();
        const [rows] = await db.query(`
            SELECT a.appointment_id AS id, 
            CONCAT(p.fname, ' ', p.lname) AS patient, 
            DATE_FORMAT(a.apdate, '%e %b %Y') AS date, 
            DATE_FORMAT(a.apdate, '%H:%i น.') AS time, 
            a.department, CONCAT( CASE WHEN d.position = 1 THEN (CASE WHEN d.gender = 1 THEN 'นพ. ' ELSE 'พญ. ' END) 
            ELSE (CASE WHEN d.gender = 1 THEN 'นาย ' ELSE 'นาง/น.ส. ' END) END,
            d.fname, ' ', d.lname ) AS doctorname,
            a.status, 
            a.patient_status
            FROM Appointment a 
            JOIN Patient p ON a.patient_id = p.patient_id 
            JOIN Medical_Personnel d ON a.medical_personnel_id = d.medical_personnel_id 
            ORDER BY a.apdate ASC
        `);

        return NextResponse.json(rows);
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    let db;
    try {
        const appointmentData = await request.json();
        const dateTimeString = `${appointmentData.date}T${appointmentData.time}:00`;
        const appointmentDateTime = new Date(dateTimeString);

        const patientvalues = [
            appointmentData.patientId,
            appointmentData.doctorId,
            appointmentData.department,
            appointmentDateTime,
            appointmentData.status,
            appointmentData.patient_status,
            appointmentData.symptoms
        ];


        db = await createConnection();


        const sqlPrimary = `
            INSERT INTO Appointment (
                patient_id,medical_personnel_id,department,apdate,status,patient_status,symptoms
            ) VALUES (?, ?, ?, ?, ?,?,?)
        `;

        const [resultPrimary] = await db.execute(sqlPrimary, patientvalues);
        const patientId = resultPrimary.insertId;

        return NextResponse.json({
            message: 'นัดหมายสำเร็จ',
            insertId: patientId
        }, { status: 201 });

    } catch (error) {
        console.error("TRANSACTION FAILED:", error);

        return NextResponse.json({
            error: 'ไม่สามารถบันทึกข้อมูลได้',
            message: (error as Error).message
        }, { status: 500 });
    }
}