import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }>}) {
    const { id: meeting_id } = await params;
    const dbPool = getDbPool();
    let db = null;

    try {
        db = await dbPool.getConnection();

        const sql = `
            SELECT
            CONCAT(
                    CASE 
                        WHEN d.position = 1 THEN (CASE WHEN d.gender = 1 THEN 'นพ. ' ELSE 'พญ. ' END) 
                        ELSE (CASE WHEN d.gender = 1 THEN 'นาย ' ELSE 'นาง/น.ส. ' END) 
                    END,
                    d.fname, ' ', d.lname
                ) AS doctorname
            FROM Appointment a
            JOIN Medical_Personnel d ON a.medical_personnel_id = d.medical_personnel_id
            WHERE a.meeting_id = ?
        `;

        const [rows] = await db.query<RowDataPacket[]>(sql, [meeting_id]);

        if (!rows || rows.length === 0) {
            return NextResponse.json({ error: 'ไม่พบข้อมูลแพทย์จากการนัดหมายนี้' }, { status: 404 });
        }
        console.log(rows[0])
        return NextResponse.json(rows[0]);

    } catch (error) {
        console.error("DOCTOR SEARCH FAILED:", error);
        return NextResponse.json({
            error: 'ไม่สามารถค้นหาข้อมูลแพทย์ได้',
            message: (error as Error).message
        }, { status: 500 });
    } finally {
        if (db) {
            db.release();
        }
    }
}