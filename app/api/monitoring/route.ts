import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

interface MonitoringUpdatePayload {
    appointmentId: string;
    isMonitoring: boolean;
    monitoringEndDate?: string;
}

export async function PATCH(request: Request) {
    const dbPool = getDbPool();
    let db = null;

    try {
        // 1. รับข้อมูลจาก Body
        const payload: MonitoringUpdatePayload = await request.json();
        const { appointmentId, isMonitoring, monitoringEndDate } = payload;

        if (!appointmentId) {
            return NextResponse.json({ error: 'Missing appointmentId in request body.' }, { status: 400 });
        }

        db = await dbPool.getConnection();
        
        const updateFields: string[] = [];
        const params: (string | boolean | null)[] = [];

        updateFields.push('is_monitoring = ?');
        params.push(isMonitoring);

        if (monitoringEndDate) {
            updateFields.push('monitoring_end_date = ?');
            params.push(monitoringEndDate);
        } else if (!isMonitoring) {
            updateFields.push('monitoring_end_date = NULL');
        }

        if (updateFields.length === 0) {
            return NextResponse.json({ message: 'No fields to update provided.' }, { status: 200 });
        }

        const sql = `
            UPDATE Diagnosis
            SET 
                ${updateFields.join(', ')}
            WHERE 
                appointment_id = ?
        `;
        
        params.push(appointmentId);

        await db.query(sql, params);

        return NextResponse.json({ message: 'Monitoring status updated successfully.' });

    } catch (error) {
        console.error("Error updating monitoring status:", error);
        return NextResponse.json(
            { error: (error as Error).message || "An unexpected error occurred during the update." },
            { status: 500 }
        );
    } finally {
        if (db) {
            db.release();
        }
    }
}