/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db'
import { ResultSetHeader } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';

export async function GET(request: Request) {
    const dbPool = getDbPool();
    let db = null;

    try {
        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');
        const appointmentId = searchParams.get('appointmentId');

        if (!patientId) {
            return NextResponse.json({ error: 'Missing patientId query parameter' }, { status: 400 });
        }

        db = await dbPool.getConnection();

        let whereClause = `vs.patient_id = ?`; 
        const params: any[] = [patientId];

        if (appointmentId && appointmentId !== "0") {
            whereClause += ` AND vs.appointment_id = ?`;
            params.push(appointmentId);
        }

        const sql = `
            SELECT 
                vs.vital_signs_id, -- เพิ่ม ID ของสัญญาณชีพไปด้วย
                vs.appointment_id, 
                vs.sbp as systolic, 
                vs.dbp as diastolic, 
                vs.pr, -- เพิ่มชีพจร
                vs.rr, -- เพิ่มการหายใจ
                vs.weight, 
                vs.temp, 
                DATE_FORMAT(vs.record_date, '%e %b %Y') AS date,
                DATE_FORMAT(vs.record_date, '%H:%i น.') AS time,
                vs.note as notes
            FROM 
                Vital_Signs vs
            -- 🌟 ใช้ LEFT JOIN เพื่อให้ข้อมูลที่ไม่มีนัดหมาย (null) ยังแสดงผลอยู่
            LEFT JOIN 
                Appointment a ON vs.appointment_id = a.appointment_id
            WHERE 
                ${whereClause} 
            ORDER BY 
                vs.record_date DESC -- เอาอันใหม่ล่าสุดขึ้นก่อน
        `;

        const [rows] = await db.query(sql, params);
        return NextResponse.json(rows);

    } catch (error) {
        console.error("Error fetching vital signs history:", error);
        return NextResponse.json(
            { error: (error as Error).message || "An unexpected error occurred" },
            { status: 500 }
        );
    } finally {
        if (db) db.release();
    }
}


export async function POST(request: Request) {
    const dbPool = getDbPool();
    let db = null;
    try {
        const vitalsSignsData = await request.json();

        const vitalsSignsValues = [
            vitalsSignsData.appointmentId,
            vitalsSignsData.systolic ?? null,
            vitalsSignsData.diastolic ?? null,
            vitalsSignsData.weight ?? null,
            vitalsSignsData.temp ?? null,
            new Date(),
            vitalsSignsData.notes ?? null,
            vitalsSignsData.patientId
        ];

        db = await dbPool.getConnection();

        const checkSql = `
            SELECT appointment_id 
            FROM Appointment 
            WHERE appointment_id = ? AND patient_id = ?;
        `;

        const [rows] = await db.query(checkSql, [vitalsSignsData.appointmentId, vitalsSignsData.patientId]);
        const checkRows = rows as RowDataPacket[];

        if (checkRows.length === 0) {
            throw new Error("Authorization failed: Appointment not found or not owned by this patient.");
        }

        const sqlPrimary = `
            INSERT INTO Vital_Signs (
                appointment_id,sbp,dbp,weight,temp,record_date,note,patient_id
            ) VALUES (?, ?, ?, ?, ?, ? ,? ,?)
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