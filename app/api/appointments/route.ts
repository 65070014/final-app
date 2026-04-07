/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import { createNotification } from '@/utils/notification';
import { createEmail } from '@/utils/email_send';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');

    const dbPool = getDbPool();
    let db = null;
    try {
        db = await dbPool.getConnection();

        let sql = `
            SELECT 
                a.appointment_id AS id, 
                a.patient_id,
                a.medical_personnel_id,
                CONCAT(p.fname, ' ', p.lname) AS patient,
                DATE_FORMAT(a.apdate, '%e %b %Y') AS date, 
                DATE_FORMAT(a.apdate, '%H:%i น.') AS time, 
                a.department, 
                CONCAT(
                    CASE 
                        WHEN d.position = 1 THEN (CASE WHEN d.gender = 1 THEN 'นพ. ' ELSE 'พญ. ' END) 
                        ELSE (CASE WHEN d.gender = 1 THEN 'นาย ' ELSE 'นาง/น.ส. ' END) 
                    END,
                    d.fname, ' ', d.lname
                ) AS doctorname,
                a.status, 
                a.patient_status
            FROM 
                Appointment a 
            JOIN 
                Patient p ON a.patient_id = p.patient_id 
            JOIN 
                Medical_Personnel d ON a.medical_personnel_id = d.medical_personnel_id
        `;

        const whereClauses = [];
        const queryParams = [];

        if (startDate && endDate) {
            whereClauses.push("DATE(a.apdate) BETWEEN ? AND ?");
            queryParams.push(startDate, endDate);
        }

        if (doctorId) {
            whereClauses.push("a.medical_personnel_id = ?");
            queryParams.push(doctorId);
        }

        if (patientId) {
            whereClauses.push("a.patient_id = ?");
            queryParams.push(patientId);
        }

        if (whereClauses.length > 0) {
            sql += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        sql += ` ORDER BY a.apdate DESC`;

        const [rows] = await db.query(sql, queryParams);
        return NextResponse.json(rows);

    } catch (error) {
        console.log("Failed to fetch appointments:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    } finally {
        if (db) {
            db.release();
        }
    }
}

export async function POST(request: Request) {
    const dbPool = getDbPool();
    let db = null;
    try {
        const appointmentData = await request.json();
        const dateTimeString = `${appointmentData.date}T${appointmentData.time}:00`;
        const appointmentDateTime = new Date(dateTimeString);
        const creator_type = appointmentData.patient_status === "Confirmed" ? 'Nurse' : 'Patient'

        const now = new Date();
        if (appointmentDateTime <= now) {
            return NextResponse.json({
                error: 'ไม่สามารถนัดหมายในวันที่ผ่านมาแล้วได้'
            }, { status: 400 });
        }

        const patientvalues = [
            appointmentData.patientId,
            appointmentData.doctorId,
            appointmentData.department,
            appointmentDateTime,
            appointmentData.status,
            appointmentData.patient_status,
            appointmentData.symptoms,
            uuidv4()
        ];

        db = await dbPool.getConnection();

        const sqlCheckApptConfirm = `SELECT 1 FROM Appointment WHERE status = 'Confirmed' AND apdate = ? AND medical_personnel_id = ?`;
        const [existing] = await db.execute(sqlCheckApptConfirm, [appointmentDateTime, appointmentData.doctorId]) as [RowDataPacket[], any];

        if (existing.length > 0) {
            return NextResponse.json({
                error: 'ช่วงเวลานี้มีผู้จองแล้ว กรุณาเลือกเวลาอื่น'
            }, { status: 400 });
        }

        const sqlPrimary = `
            INSERT INTO Appointment (
                patient_id,medical_personnel_id,department,apdate,status,patient_status,symptoms,meeting_id
            ) VALUES (
             ?, ?, ?, ?, ?,?,?,?
            )
        `;

        const [resultPrimary] = await db.execute(sqlPrimary, patientvalues) as [ResultSetHeader, any];;
        console.log(resultPrimary)
        const appointment_id = resultPrimary.insertId;
        const thaiTime = format(new Date(appointmentDateTime), "dd MMM yyyy", { locale: th })
        await createNotification(
            db,
            appointmentData.patientId,
            creator_type,
            'APPOINTMENT_CREATED',
            creator_type === 'Nurse'
                ? `มีนัดหมายใหม่จากผู้ป่วยวันที่ ${thaiTime} โปรดตรวจสอบและยืนยัน`
                : `คุณมีนัดหมายใหม่วันที่ ${thaiTime} โปรดทำการยืนยันการนัดหมาย`,
            creator_type === 'Nurse'
                ? `/nurse/appointment_history`
                : `/patient/appointments?selected=${appointment_id}`
        );

        const sqlGetEmail = `SELECT email FROM Patient WHERE patient_id = ?`;
        const [patientRows] = await db.execute(sqlGetEmail, [appointmentData.patientId]) as [RowDataPacket[], any];

        if (patientRows.length > 0 && patientRows[0].email) {
            const patientEmail = patientRows[0].email;

            await createEmail(
                patientEmail,
                "🏥 แจ้งเตือนการนัดหมายใหม่ (Telemedicine)",
                creator_type === 'Nurse'
                    ? `เจ้าหน้าที่ได้ทำการนัดหมายให้ท่านในวันที่ ${thaiTime} โปรดตรวจสอบรายละเอียดในระบบ`
                    : `คุณได้สร้างนัดหมายสำเร็จสำหรับวันที่ ${thaiTime} โปรดรอเจ้าหน้าที่ยืนยัน`
            );
            console.log(`ส่งอีเมลแจ้งเตือนไปที่ ${patientEmail} สำเร็จ!`);
        } else {
            console.log(`ข้ามการส่งอีเมล: ไม่พบข้อมูลอีเมลของ Patient ID ${appointmentData.patientId}`);
        }
        const resultHeader = resultPrimary as ResultSetHeader;
        const patientId = resultHeader.insertId;

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
    } finally {
        if (db) {
            db.release();
        }
    }
}