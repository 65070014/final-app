import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, ChevronRight, Clock } from "lucide-react"

export function HistorySection() {
  const recentVisits = [
    {
      date: "28 ธ.ค. 2567",
      department: "แผนกอายุรกรรม",
      doctor: "แพทย์หญิงสุดา จันทร์เพ็ญ",
      diagnosis: "ตรวจสุขภาพประจำปี",
      status: "เสร็จสิ้น",
    },
    {
      date: "15 พ.ย. 2567",
      department: "แผนกโรคหัวใจ",
      doctor: "นายแพทย์วิชัย สุขใส",
      diagnosis: "ตรวจคลื่นไฟฟ้าหัวใจ",
      status: "เสร็จสิ้น",
    },
    {
      date: "3 ต.ค. 2567",
      department: "แผนกเวชศาสตร์ป้องกัน",
      doctor: "แพทย์หญิงมาลี ใจดี",
      diagnosis: "ฉีดวัคซีนไข้หวัดใหญ่",
      status: "เสร็จสิ้น",
    },
  ]

  return (
    <div>
      {/* ประวัติการรักษาล่าสุด */}
      <Card className="lg:col-span-2 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">ประวัติการรักษาล่าสุด</h3>
          </div>
          <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-500/80">
            ดูทั้งหมด
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="space-y-4">
          {recentVisits.map((visit, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground">{visit.department}</p>
                    <Badge variant="secondary" className="text-xs">
                      {visit.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{visit.doctor}</p>
                  <p className="text-sm text-muted-foreground">{visit.diagnosis}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{visit.date}</p>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto mt-1" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
