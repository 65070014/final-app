import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Calendar } from "lucide-react"

export function DoctorSchedule() {
  const schedule = [
    {
      date: "1 ต.ค. 2568",
      time: "09:00 - 12:00",
      patient: "นายก้องภพ ใจดี",
      department: "อายุรกรรม",
      status: "ยืนยันแล้ว",
    },
    {
      date: "1 ต.ค. 2568",
      time: "13:00 - 15:00",
      patient: "นายก้องภพ ใจไม่ดี",
      department: "หัวใจ",
      status: "รอยืนยัน",
    },
    {
      date: "2 ต.ค. 2568",
      time: "10:00 - 12:00",
      patient: "เด็กชายต้นกล้า เก่งดี",
      department: "กุมารเวช",
      status: "ยืนยันแล้ว",
    },
  ]

  return (
    <div className="space-y-4">
      {schedule.map((item, index) => (
        <Card key={index} className="p-4 space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">{item.department}</h2>
            <Badge
              variant={item.status === "ยืนยันแล้ว" ? "default" : "secondary"}
            >
              {item.status}
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {item.date}
          </div>

          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {item.time}
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" />
            <p className="text-sm">ผู้ป่วย: {item.patient}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
