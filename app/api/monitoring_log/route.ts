import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

interface MonitoringLogPayload {
    diagnosisId: string;
    medPersonnelId: string;
    analysisPlanNote: string;
}

export async function POST(request: Request) {
    const dbPool = getDbPool();
    let db = null;

    try {
        const payload: MonitoringLogPayload = await request.json();
        const { diagnosisId, medPersonnelId, analysisPlanNote } = payload;

        if (!diagnosisId || !medPersonnelId || !analysisPlanNote) {
            return NextResponse.json(
                { error: 'Missing required fields: diagnosisId, medPersonnelId, or analysisPlanNote.' }, 
                { status: 400 }
            );
        }

        db = await dbPool.getConnection();

        const sql = `
            INSERT INTO Monitoring_Log (
                diagnosis_id, 
                medical_personnel_id,
                analysis_plan_note, 
                log_datetime
            ) 
            VALUES (?, ?, ?, NOW())
        `;

        const params = [
            diagnosisId,
            medPersonnelId,
            analysisPlanNote,
        ];

        await db.query(sql, params);
        
        return NextResponse.json(
            { 
                message: 'Monitoring log saved successfully.', 
            }, 
            { status: 201 }
        );

    } catch (error) {
        console.error("Error inserting monitoring log:", error);
        return NextResponse.json(
            { error: (error as Error).message || "An unexpected error occurred during the log insertion." },
            { status: 500 }
        );
    } finally {
        if (db) {
            db.release();
        }
    }
}