"use client"

import { useEffect, useState } from "react"
import DispenseModal from "@/components/doctor/dispensing/DispenseModal" 
// หมายเหตุ: แก้ไข path ตามตำแหน่งไฟล์ DispenseModal ของคุณ
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Appointment {
    id: number
    patient_id: number
    medical_personnel_id: number
    patient: string
    date: string
    time: string
    doctorname: string
    department: string
    status: string
}

export default function DispensingPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await fetch("/api/appointments")
                const data = await res.json()
                setAppointments(data)
            } catch (err) {
                console.error(err)
            }
        }
        fetchAppointments()
    }, [])

    return (
        <div className="flex justify-center py-8">
            <div className="w-full max-w-5xl">
                <h2 className="text-2xl font-bold mb-4">การจ่ายยา</h2>

                <Card className="p-4 shadow-md">
                    <table className="w-full text-left border-collapse">
                        <thead className="border-b">
                            <tr className="text-sm font-semibold">
                                <th className="p-2">ชื่อผู้ป่วย</th>
                                <th className="p-2">วันนัด</th>
                                <th className="p-2">เวลา</th>
                                <th className="p-2">แพทย์</th>
                                <th className="p-2 text-center">การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((a) => (
                                <tr key={a.id} className="border-b hover:bg-muted/20">
                                    <td className="p-2">{a.patient}</td>
                                    <td className="p-2">{a.date}</td>
                                    <td className="p-2">{a.time}</td>
                                    <td className="p-2">{a.doctorname}</td>
                                    <td className="p-2 text-center">
                                        <Button onClick={() => setSelectedAppointment(a)}>จ่ายยา</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>

                {selectedAppointment && (
                    <DispenseModal
                        open={!!selectedAppointment}
                        onClose={() => setSelectedAppointment(null)}
                        patientId={selectedAppointment.patient_id}
                        medicalPersonnelId={selectedAppointment.medical_personnel_id}
                    />
                )}
            </div>
        </div>
    )
}