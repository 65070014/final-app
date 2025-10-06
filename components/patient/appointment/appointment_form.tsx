import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


export function AppointmentForm() {
  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ]

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">สร้างนัดหมายใหม่</h2>
      <form className="space-y-3">
        <Input type="date" placeholder="เลือกวันที่" />
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="เลือกช่วงเวลา" />
          </SelectTrigger>
          <SelectContent className="w-full">
            {timeSlots.map((time) => (
              <SelectItem key={time} value={time}>
                {time} น.
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="text" placeholder="เลือกแพทย์" />
        <Input type="text" placeholder="แผนก" />
        <Textarea placeholder="อาการ" rows={3} />
        <Button className="w-full">บันทึกนัดหมาย</Button>
      </form>
    </Card>
  )
}
