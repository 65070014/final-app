import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"


export function AppointmentForm() {
  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">สร้างนัดหมายใหม่</h2>
      <form className="space-y-3">
        <Input type="date" placeholder="เลือกวันที่" />
        <Input type="time" placeholder="เลือกเวลา" />
        <Input type="text" placeholder="เลือกแพทย์" />
        <Input type="text" placeholder="แผนก" />
        <Textarea placeholder="อาการ" rows={3} />
        <Button className="w-full">บันทึกนัดหมาย</Button>
      </form>
    </Card>
  )
}
