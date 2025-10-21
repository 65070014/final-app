import { Card } from "@/components/ui/card"

const appointments = [
  { date: "1 ต.ค. 2568", time: "10:00 น.", doctor: "นพ. สมชาย ใจดี", department: "อายุรกรรม" },
  { date: "15 พ.ย. 2568", time: "13:30 น.", doctor: "พญ. สมหญิง สายใจ", department: "โรคหัวใจ" },
]

export function AppointmentList() {
  return (
    <Card className="p-6 space-y-4 h-full shadow-lg">
      <h2 className="text-lg font-semibold">นัดหมายของคุณ</h2>
      {appointments.map((a, i) => (
        <div key={i} className="border-b pb-2">
          <p className="font-medium">{a.date} เวลา {a.time}</p>
          <p className="text-sm text-muted-foreground">
            {a.department} - {a.doctor}
          </p>
        </div>
      ))}
    </Card>
  )
}
