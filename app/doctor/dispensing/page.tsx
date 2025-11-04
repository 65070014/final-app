"use client"

import { useEffect, useState, useCallback } from "react"
import DispenseModal from "@/components/doctor/dispensing/DispenseModal"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Printer } from "lucide-react"
import Link from "next/link"
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

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
    is_prescribed: number
}

export default function DispensingPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

    const fetchAppointments = useCallback(async () => {
        try {
            const res = await fetch("/api/appointments/complete_diagnosis")
            if (!res.ok) throw new Error("Failed to fetch appointments")
            const data = await res.json()
            setAppointments(data)
        } catch (err) {
            console.error(err)
        }
    }, [])

    useEffect(() => {
        fetchAppointments()
    }, [fetchAppointments])

    const handleDispenseSuccess = () => {
        fetchAppointments();
    }

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
                                    <td className="p-2">{format(new Date(a.date), "dd MMM yyyy", { locale: th })}</td>
                                    <td className="p-2">{a.time}</td>
                                    <td className="p-2">{a.doctorname}</td>
                                    <td className="p-3 text-center">
                                        {a.is_prescribed ? (
                                            <div className="flex justify-center items-center gap-2 sm:gap-4">
                                                <span className="flex items-center text-sm text-green-600 dark:text-green-400 font-medium whitespace-nowrap">
                                                    <CheckCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                                                    สั่งยาแล้ว
                                                </span>
                                                <p></p>
                                                <div>
                                                    <Link href={`/doctor/prescription/${a.id}`} passHref >
                                                        <Button variant="outline" size="sm" className="bg-green-500 text-white hover:bg-green-600 border-green-500 hover:border-green-600 dark:bg-green-600 dark:hover:bg-green-700 dark:border-green-600">
                                                            <Printer className="w-4 h-4 mr-1.5" />
                                                            พิมพ์
                                                        </Button>
                                                    </Link>
                                                </div>

                                            </div>
                                        ) : (
                                            <Button onClick={() => setSelectedAppointment(a)}>จ่ายยา</Button>
                                        )}
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
                        appointmentId={selectedAppointment.id}
                        onSuccess={handleDispenseSuccess}
                    />
                )}
            </div>
        </div>
    )
}
