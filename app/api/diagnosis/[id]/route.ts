// File: /api/diagnosis/[id]/route.ts

import { getDbPool } from '@/lib/db'
import { RowDataPacket } from 'mysql2';
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    // id ที่รับเข้ามาคือ diagnosis_id
    const { id: appointment_id } = await params;
    const dbPool = getDbPool();
    let db = null;

    try {
        db = await dbPool.getConnection();

        // --- SQL Query ที่แก้ไขใหม่ ---
        // เราทำการ JOIN ตาราง Diagnosis, Appointment, Patient, และ Medical_Personnel
        // เพื่อดึงข้อมูลที่จำเป็นทั้งหมดในครั้งเดียว
        const sql = `
            SELECT
                CONCAT(p.fname, ' ', p.lname) AS patient_name,
                CONCAT(mp.fname, ' ', mp.lname) AS doctor_name,
                d.diag_name AS diagnosis,
                DATE_FORMAT(d.monitoring_end_date, '%d %M %Y') AS diagnosis_date,
                d.rest_days
            FROM
                Diagnosis d
            JOIN
                Appointment a ON d.appointment_id = a.appointment_id
            JOIN
                Patient p ON a.patient_id = p.patient_id
            JOIN
                Medical_Personnel mp ON a.medical_personnel_id = mp.medical_personnel_id
            WHERE
                d.appointment_id = ?; 
        `;

        const [rows] = await db.query<RowDataPacket[]>(sql, [appointment_id]);

        // ตรวจสอบว่ามีข้อมูลหรือไม่
        if (!rows || rows.length === 0) {
            return NextResponse.json({ error: "Diagnosis not found" }, { status: 404 });
        }

        // คืนค่าข้อมูลแถวแรก (ซึ่งควรจะมีแค่แถวเดียว) เป็น object
        return NextResponse.json(rows[0]);

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    } finally {
        if (db) {
            db.release();
        }
    }
}