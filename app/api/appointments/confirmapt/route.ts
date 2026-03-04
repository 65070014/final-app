import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get("date")
  const doctorId = searchParams.get("doctorId")

  if (!date || !doctorId) {
    return NextResponse.json(
      { error: "Missing parameters" },
      { status: 400 }
    )
  }

  const db = await getDbPool().getConnection()

  const [rows] = await db.execute(
    `
    SELECT DATE_FORMAT(apdate, '%H:%i') as time
    FROM Appointment
    WHERE status = 'Confirmed'
    AND medical_personnel_id = ?
    AND DATE(apdate) = ?
    `,
    [doctorId, date]
  )

  db.release()

  return NextResponse.json(rows)
}