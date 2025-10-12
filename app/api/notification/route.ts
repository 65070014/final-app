import { NextResponse,NextRequest } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET(request: NextRequest) {
    const dbPool = getDbPool(); 
    let db = null;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const role = searchParams.get('role');

    try {
        db = await dbPool.getConnection(); 
        const [rows] = await db.query(

            `SELECT notification_type,message_text,is_read,link_url,create_at FROM Notification
            WHERE recipient_id = ?
            AND recipient_type = ?
            ORDER BY create_at DESC`,
            [id,role]
        );
        console.log(rows)
        return NextResponse.json(rows);

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }finally {
        if (db) {
            db.release(); 
        }
    }
}