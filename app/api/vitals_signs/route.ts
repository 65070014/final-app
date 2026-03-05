import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db'
import { ResultSetHeader } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';

export async function POST(request: Request) {
    const dbPool = getDbPool();
    let db = null;
    try {
        const vitalsSignsData = await request.json();

        const finalAppointmentId = (vitalsSignsData.appointmentId === 0 || !vitalsSignsData.appointmentId)
            ? null
            : vitalsSignsData.appointmentId;

        const vitalsSignsValues = [
            finalAppointmentId,
            vitalsSignsData.pr,
            vitalsSignsData.rr,
            vitalsSignsData.sbp,
            vitalsSignsData.dbp,
            vitalsSignsData.weight,
            vitalsSignsData.temperature,
            new Date(),
            vitalsSignsData.patientId,
            vitalsSignsData.note
        ];

        db = await dbPool.getConnection();

        const hasAppointment = vitalsSignsData.appointmentId && vitalsSignsData.appointmentId !== 0;

        if (hasAppointment) {
            const checkSql = `
        SELECT appointment_id 
        FROM Appointment 
        WHERE appointment_id = ? AND patient_id = ?;
    `;
            const [rows] = await db.query(checkSql, [vitalsSignsData.appointmentId, vitalsSignsData.patientId]);
            const checkRows = rows as RowDataPacket[];

            if (checkRows.length === 0) {
                throw new Error("ไม่พบนัดหมายนี้ หรือนัดหมายไม่ได้เป็นของผู้ป่วยรายนี้");
            }
        } else {
            const checkPatientSql = `SELECT patient_id FROM Patient WHERE patient_id = ?;`;
            const [patientRows] = await db.query(checkPatientSql, [vitalsSignsData.patientId]);
            const checkPatient = patientRows as RowDataPacket[];

            if (checkPatient.length === 0) {
                throw new Error("ไม่พบข้อมูลผู้ป่วยในระบบ");
            }
        }

        const sqlPrimary = `
            INSERT INTO Vital_Signs (
                appointment_id, pr,rr,sbp,dbp,weight,temp,record_date,patient_id,note
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?)
        `;

        const [resultPrimary] = await db.execute(sqlPrimary, vitalsSignsValues);
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