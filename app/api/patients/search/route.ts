import { NextResponse, NextRequest } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');

    if (!q || q.trim() === '') {
        return NextResponse.json([]);
    }

    const dbPool = getDbPool();
    let db = null;

    try {
        db = await dbPool.getConnection();
        const sql = `
            SELECT 
                patient_id AS id, 
                CONCAT(fname, ' ', lname) AS name, 
                cid 
            FROM Patient 
            WHERE fname LIKE ? 
               OR lname LIKE ? 
               OR cid LIKE ?
            LIMIT 3
        `;
        
        const searchTerm = `%${q}%`;
        const [rows] = await db.query(sql, [searchTerm, searchTerm, searchTerm]);
        return NextResponse.json(rows);

    } catch (error) {
        console.error("❌ Patient Search Error:", error);
        return NextResponse.json({ error: 'Failed to search patients' }, { status: 500 });
    } finally {
        if (db) db.release();
    }
}