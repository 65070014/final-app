import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Stethoscope } from "lucide-react"
import { Button } from "../ui/button"

export function TreatmentHistory() {
  const records = [
    {
      date: "1 ต.ค. 2568",
      time: "10:30 น.",
      doctor: "นพ. สมชาย ใจดี",
      department: "อายุรกรรม",
      diagnosis: "ตรวจโรคเบื้องต้น, วัดความดัน",
      status: "เสร็จสิ้น",
    },
    {
      date: "15 ก.ย. 2568",
      time: "14:00 น.",
      doctor: "พญ. สุชาดา แพทย์หญิง",
      department: "หัวใจ",
      diagnosis: "ตรวจคลื่นหัวใจ (ECG)",
      status: "เสร็จสิ้น",
    },
    {
      date: "30 ส.ค. 2568",
      time: "09:00 น.",
      doctor: "นพ. วิทยา แสนสุข",
      department: "กายภาพบำบัด",
      diagnosis: "ทำกายภาพฟื้นฟู",
      status: "เสร็จสิ้น",
    },
  ]

  return (
    <div className="space-y-4">
      {records.map((record, index) => (
        <Card key={index} className="p-4 space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">{record.department}</h2>
            <Badge>{record.status}</Badge>
          </div>

          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {record.date} เวลา {record.time}
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" />
            <p className="text-sm">แพทย์ผู้รักษา: {record.doctor}</p>
          </div>

          <div className="flex items-start gap-2">
            <Stethoscope className="h-4 w-4 text-green-500 mt-1" />
            <p className="text-sm">การวินิจฉัย: {record.diagnosis}</p>
          </div>
          <Button variant="outline" size="sm">ดูรายละเอียดการรักษา</Button>
        </Card>
      ))}
    </div>
  )
}
