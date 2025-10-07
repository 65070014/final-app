// app/api/register-patient/route.ts

import { NextResponse } from 'next/server';
import { createConnection } from '@/lib/db'

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
            appointmentData.symptoms
        ];


        db = await createConnection();


        const sqlPrimary = `
            INSERT INTO Appointment (
                patient_id,medical_personnel_id,department,apdate,status,symptoms
            ) VALUES (?, ?, ?, ?, 'Pending',?)
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