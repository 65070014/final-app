import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';


export async function GET(request: Request, { params } : { params: Promise<{ id: string }> }) {
    const { id: appointment_id } = await params;
    const dbPool = getDbPool();
    let db = null;

    try {
        db = await dbPool.getConnection();
        const [rows] = await db.query(

            `SELECT
                a.appointment_id AS id, 
                a.apdate,
                a.status,
                a.patient_status,
                CONCAT(p.fname, ' ', p.lname) AS patient,
                a.department, 
                CONCAT( 
                    CASE 
                        WHEN d.position = 1 THEN (CASE WHEN d.gender = 1 THEN 'นพ. ' ELSE 'พญ. ' END) 
                        ELSE (CASE WHEN d.gender = 1 THEN 'นาย ' ELSE 'นาง/น.ส. ' END) 
                    END,
                    d.fname, ' ', d.lname 
                ) AS doctorname,
                DATE_FORMAT(a.apdate, '%e %b %Y') AS date, 
                DATE_FORMAT(a.apdate, '%H:%i น.') AS time, 
                CASE 
                    WHEN COUNT(v.appointment_id) > 0 THEN 1 
                    ELSE 0 
                END AS is_vitals_filled
                FROM 
                    Appointment a 
                JOIN 
                    Patient p ON a.patient_id = p.patient_id 
                JOIN 
                    Medical_Personnel d ON a.medical_personnel_id = d.medical_personnel_id 
                LEFT JOIN 
                    Vital_Signs v ON a.appointment_id = v.appointment_id 
                WHERE 
                    a.appointment_id = ?
                GROUP BY 
                    a.appointment_id, a.apdate, a.status, a.patient_status, 
                    p.fname, p.lname, a.department, d.position, d.gender, d.fname, d.lname
                ORDER BY 
                a.apdate ASC;`,
            [appointment_id]
        );
        console.log(rows)
        return NextResponse.json(rows);

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    } finally {
        if (db) {
            db.release();
        }
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: appointmentId } = await params;
    let body = {};
    body = await request.json();

    const dbPool = getDbPool();
    let db = null;

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { status, patient_status, date, time } = body as any;
        const updates = [];
        const values = [];

        if (status) {
            updates.push("status = ?");
            values.push(status);
        }

        if (patient_status) {
            updates.push("patient_status = ?");
            values.push(patient_status);
        }

        if (date && time) {
            const appointmentDateTime = `${date}T${time}:00`; // รวม date และ time เป็น DATETIME
            updates.push("apdate = ?");
            values.push(appointmentDateTime);
        }


        if (updates.length === 0) {
            return NextResponse.json({ error: 'ไม่มีข้อมูลสำหรับอัปเดตใน request body' }, { status: 400 });
        }

        db = await dbPool.getConnection();

        const sql = `
            UPDATE Appointment 
            SET ${updates.join(', ')} 
            WHERE appointment_id = ?
        `;

        values.push(appointmentId);

        const [result] = await db.execute(sql, values);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((result as any).affectedRows === 0) {
            return NextResponse.json({ error: 'ไม่พบการนัดหมายที่ต้องการอัปเดต' }, { status: 404 });
        }

        return NextResponse.json({ message: 'อัปเดตสถานะการนัดหมายสำเร็จ' });

    } catch (error) {
        console.error("Failed to update appointment status:", error);
        return NextResponse.json({
            error: 'ไม่สามารถอัปเดตสถานะได้',
            message: (error as Error).message
        }, { status: 500 });
    } finally {
        if (db) {
            db.release();
        }
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: appointment_id } = await params;
    const body = await request.json();

    const dbPool = getDbPool();
    let db = null;

    try {
        db = await dbPool.getConnection();
        await db.query(
            `UPDATE Appointment
            SET patient_status = ?
            WHERE appointment_id = ?`,
            [body.patient_status, appointment_id]
        );

        return NextResponse.json({
            message: 'Patient status updated successfully.',
            appointment_id: appointment_id,
        }, { status: 200 });

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    } finally {
        if (db) {
            db.release();
        }
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: appointment_id } = await params;
    const body = await request.json();

    console.log(body.selectedDate, body.selectedTime)

    const combinedString = `${body.selectedDate} ${body.selectedTime}:00`;

    const dbPool = getDbPool();
    let db = null;

    try {
        db = await dbPool.getConnection();
        await db.beginTransaction();

        await db.query(
            `UPDATE Appointment
            SET status = 'Rescheduled'
            WHERE appointment_id = ?`,
            [appointment_id]
        );

        await db.query(
            `INSERT INTO Appointment (
            patient_id, 
            medical_personnel_id, 
            apdate,
            status,
            patient_status,
            department,
            staff_id,
            date_serv,
            symptoms
            )
            SELECT 
                patient_id, 
                medical_personnel_id, 
                ?,
                'Pending',
                patient_status,
                department,
                staff_id,
                date_serv,
                symptoms
            FROM 
                Appointment
            WHERE 
                appointment_id = ?;

            `, [combinedString, appointment_id]);

        await db.commit();

        return NextResponse.json({
            message: 'Rescheduled successfully.',
            appointment_id: appointment_id,
        }, { status: 200 });

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    } finally {
        if (db) {
            db.release();
        }
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const appointmentId = params.id;
    const dbPool = getDbPool();
    let db = null;

    try {
        db = await dbPool.getConnection();

        const sql = `DELETE FROM Appointment WHERE appointment_id = ?`;

        const [result] = await db.execute(sql, [appointmentId]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((result as any).affectedRows === 0) {
            return NextResponse.json({ error: 'ไม่พบการนัดหมายที่ต้องการลบ' }, { status: 404 });
        }

        return NextResponse.json({ message: 'ลบการนัดหมายสำเร็จ' });

    } catch (error) {
        console.error("Failed to delete appointment:", error);
        return NextResponse.json({
            error: 'ไม่สามารถลบการนัดหมายได้',
            message: (error as Error).message
        }, { status: 500 });
    } finally {
        if (db) {
            db.release();
        }
    }
}