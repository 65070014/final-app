import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET() {
    const dbPool = getDbPool();
    let db = null;
    try {
        db = await dbPool.getConnection();
        
        const sql = `
            SELECT medication_id, medicine_name, strength
            FROM Medication 
        `;
        
        const [rows] = await db.query(sql)

        return NextResponse.json(rows);

    } catch (error) {
        console.error("MEDICATION SEARCH FAILED:", error);
        return NextResponse.json({ 
            error: 'ไม่สามารถค้นหาข้อมูลยาได้',
            message: (error as Error).message 
        }, { status: 500 });
    } finally {
        if (db) {
            db.release();
        }
    }
}