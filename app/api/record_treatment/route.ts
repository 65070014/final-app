
import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { RowDataPacket,ResultSetHeader } from 'mysql2/promise';

interface DiagnosisNote {
    diagName: string;
    diagCode: string;
    treatmentNote: string;
}

interface Medication {
    id: string;
    name: string;
    dosage: string;
    usage: string;
    quantity: string;
    note: string
}

interface Monitoring {
    isActive: boolean;
    endDate: string; 
}

interface DiagnosisData {
    appointmentId: string;
    diagnosisNote: DiagnosisNote;
    medications: Medication[];
    monitoring: Monitoring;
}

export async function POST(request: Request) {
    const dbPool = getDbPool();
    let db = null;

    try {
        const body: DiagnosisData = await request.json();
        const {appointmentId, diagnosisNote, medications, monitoring } = body;

        console.log(appointmentId, diagnosisNote, medications, monitoring)

        if (!appointmentId || !diagnosisNote.diagCode) {
            return NextResponse.json({ message: 'Missing required data (Doctor ID, Appointment ID, or Diagnosis Code).' }, { status: 400 });
        }

        db = await dbPool.getConnection();
        await db.beginTransaction(); 

        try {
            await db.execute(
                `INSERT INTO Diagnosis (
                    appointment_id, 
                    diag_code, 
                    diag_name, 
                    note, 
                    is_monitoring, 
                    monitoring_end_date
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    appointmentId,
                    diagnosisNote.diagCode,
                    diagnosisNote.diagName,
                    diagnosisNote.treatmentNote,
                    monitoring.isActive,
                    monitoring.isActive ? monitoring.endDate : null,
                ]
            );
            

            await db.execute(
                `UPDATE Appointment SET status = ? WHERE appointment_id = ?`,
                ['Complete', appointmentId]
            );

            const [appointmentRows] = await db.execute<RowDataPacket[]>(
                `SELECT patient_id, medical_personnel_id FROM Appointment WHERE appointment_id = ?`,
                [appointmentId]
            );

            const patientId = appointmentRows[0].patient_id;
            const doctorId = appointmentRows[0].medical_personnel_id;

            const [prescriptionResult] = await db.execute(
                `INSERT INTO Prescription (
                    patient_id, 
                    medical_personnel_id,
                    prescription_date,
                    note,
                    appointment_id
                ) VALUES (?, ?, NOW(), ?, ?)`,
                [patientId, doctorId, "" , appointmentId]
            );

            const prescriptionId = (prescriptionResult as ResultSetHeader).insertId;


            if (medications && medications.length > 0) {
                const medicationValues = medications.map(med => [
                    prescriptionId,
                    med.id,
                    med.usage,
                    med.dosage,
                    med.quantity,
                    med.note,
                ]).flat();

                const medicationPlaceholders = medications.map(() => `(?, ?, ?, ?, ?, ?)`).join(', ');

                await db.execute(
                    `INSERT INTO Prescription_Medication (
                        prescription_id, 
                        medication_id, 
                        usage,
                        dosage,
                        quantity, 
                        note
                    ) VALUES ${medicationPlaceholders}`,
                    medicationValues
                );
            }

            await db.commit();
            db.release();

            return NextResponse.json({ 
                success: true, 
                message: 'Diagnosis and medications saved successfully.'
            }, { status: 201 });

        } catch (dbError) {
            await db.rollback();
            db.release();
            console.error('Database Transaction Error:', dbError);
            return NextResponse.json({ message: 'Database error during transaction.' }, { status: 500 });
        }

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ message: 'Internal Server Error.' }, { status: 500 });
    }finally {
        if (db) {
            db.release();
        }
    }
}