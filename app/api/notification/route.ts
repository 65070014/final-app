/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const role = searchParams.get('role');

    const dbPool = getDbPool(); 
    let db = null;

    try {
        db = await dbPool.getConnection(); 
        let sqlQuery = '';
        let queryParams: any[] = [];

        if (role === 'Nurse') {
            sqlQuery = `
                SELECT notification_id, notification_type, message_text, is_read, link_url, create_at 
                FROM Notification
                WHERE recipient_type = 'Nurse'
                ORDER BY create_at DESC
            `;
            queryParams = []; 

        } else if (role === 'Patient' || role === 'Doctor') {
            sqlQuery = `
                SELECT notification_id, notification_type, message_text, is_read, link_url, create_at 
                FROM Notification
                WHERE recipient_id = ? AND recipient_type = ?
                ORDER BY create_at DESC
            `;
            queryParams = [id, role];

        } else {
            return NextResponse.json({ error: 'Role ไม่ถูกต้อง' }, { status: 400 });
        }
        const [rows] = await db.query(sqlQuery, queryParams);
        
        return NextResponse.json(rows);

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    } finally {
        if (db) {
            db.release(); 
        }
    }
}
export async function PATCH(request: NextRequest) {
    const data = await request.json();
    const { id, role } = data;
    const dbPool = getDbPool(); 
    let db = null;

    try {
        db = await dbPool.getConnection(); 
        let sqlUpdate = '';
        let queryParams: any[] = [];

        if (role === 'Nurse') {
            sqlUpdate = `UPDATE Notification SET is_read = 1 WHERE recipient_type = 'Nurse' AND is_read = 0`;
            queryParams = [];
        } else if (role === 'Patient' || role === 'Doctor') {
            if (!id) return NextResponse.json({ error: 'ต้องระบุ ID' }, { status: 400 });
            
            sqlUpdate = `UPDATE Notification SET is_read = 1 WHERE recipient_id = ? AND recipient_type = ? AND is_read = 0`;
            queryParams = [id, role];
        }

        await db.query(sqlUpdate, queryParams);
        
        return NextResponse.json({ success: true, message: 'อัปเดตสถานะการอ่านเรียบร้อยแล้ว' });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    } finally {
        if (db) db.release(); 
    }
}