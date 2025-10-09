import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db'
import { ResultSetHeader } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';

export async function POST(request: Request) {
    const dbPool = getDbPool(); 
    let db = null;
    try {
        const vitalsSignsData = await request.json();

        const vitalsSignsValues = [
            vitalsSignsData.appointmentId,
            vitalsSignsData.pr,
            vitalsSignsData.rr,
            vitalsSignsData.sbp,
            vitalsSignsData.dbp,
            vitalsSignsData.weight,
            vitalsSignsData.temperature,
            new Date()
        ];

        db = await dbPool.getConnection(); 

        const checkSql = `
            SELECT appointment_id 
            FROM Appointment 
            WHERE appointment_id = ? AND patient_id = ?;
        `;
        console.log(vitalsSignsData.appointmentId,vitalsSignsData.patientId)
        console.log(vitalsSignsValues)

        const [rows] = await db.query(checkSql, [vitalsSignsData.appointmentId, vitalsSignsData.patientId]);
        const checkRows = rows as RowDataPacket[]; 

        if (checkRows.length === 0) {
            throw new Error("Authorization failed: Appointment not found or not owned by this patient.");
        }

        const sqlPrimary = `
            INSERT INTO Vital_Signs (
                appointment_id, pr,rr,sbp,dbp,weight,temp,record_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
    }finally {
        if (db) {
            db.release(); 
        }
    }
}