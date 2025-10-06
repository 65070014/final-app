import { Card } from "@/components/ui/card"

export function AppointmentHeader() {
  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold text-foreground">การนัดหมาย</h1>
      <p className="text-muted-foreground">ดูนัดหมายที่มีอยู่และสร้างนัดหมายใหม่</p>
    </Card>
  )
}
