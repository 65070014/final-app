"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Calendar } from "lucide-react"

export function DoctorSchedule() {
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
    <div className="space-y-4">
      {appointments.map((appt) => (
        <Card key={appt.id} className="p-4 space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">{appt.department}</h2>
            <Badge
              variant={appt.status === "Confirmed" ? "default" : "secondary"}
            >
              {appt.status}
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {appt.date}
          </div>

          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {appt.time}
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" />
            <p className="text-sm">ผู้ป่วย: {appt.patient}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
