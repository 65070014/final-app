"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Calendar, HeartPulse} from "lucide-react"
import { Button } from "@/components/ui/button"


export function DoctorSchedule() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [appointments, setAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/appointments")
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ")
        const data = await res.json()
        setAppointments(data)
      } catch (err) {
        console.error("Error fetching appointments:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAppointments()
  }, [])

  if (isLoading) {
    return <div>กำลังโหลดข้อมูล...</div>
  }

  if (!appointments.length) {
    return <div>ไม่พบนัดหมาย</div>
  }

  return (
    <div className="space-y-4 p-6 max-w-4xl mx-auto bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg shadow-lg ">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">ตารางนัดหมายแพทย์</h1>
      {appointments.map((appt) => (
        <Card key={appt.id} className="p-4 space-y-3 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{appt.department}</h2>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  appt.status === "Complete" ? "default" :
                    appt.status === "Confirmed" ? "default" : "secondary"
                }
                className="capitalize"
              >
                {appt.status}
              </Badge>

              {appt.status === "Complete" && (
                <a href={`/doctor/medical_certificate/${appt.id}`} >
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <HeartPulse className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">พิมพ์ใบรับรองแพทย์</span>
                  </Button>
                </a >
              )}
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{appt.date}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{appt.time}</span>
            </div>
          </div>

          <div className="border-t dark:border-gray-700 pt-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">ผู้ป่วย: {appt.patient}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
