"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { VitalRecord } from "@/app/patient/vitals_track/page"

type VitalSignsFormProps = {
  onSubmit: (record: Omit<VitalRecord, "id">) => void
}

export function VitalSignsForm({ onSubmit }: VitalSignsFormProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false }),
  )
  const [systolic, setSystolic] = useState<string>("")
  const [diastolic, setDiastolic] = useState<string>("")
  const [weight, setWeight] = useState<string>("")
  const [bloodSugar, setBloodSugar] = useState<string>("")
  const [notes, setNotes] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const record: Omit<VitalRecord, "id"> = {
      date: format(date, "yyyy-MM-dd"),
      time,
      systolic: systolic ? Number(systolic) : undefined,
      diastolic: diastolic ? Number(diastolic) : undefined,
      weight: weight ? Number(weight) : undefined,
      bloodSugar: bloodSugar ? Number(bloodSugar) : undefined,
      notes: notes.trim() || undefined,
    }

    onSubmit(record)

    // Reset form
    setSystolic("")
    setDiastolic("")
    setWeight("")
    setBloodSugar("")
    setNotes("")
    setDate(new Date())
    setTime(new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false }))
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">บันทึกข้อมูลล่าสุด</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date">วันที่วัด</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: th }) : "เลือกวันที่"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">เวลาที่วัด</Label>
            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>ความดันโลหิต (mmHg)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="systolic" className="text-sm text-muted-foreground">
                  ตัวบน (Systolic)
                </Label>
                <Input
                  id="systolic"
                  type="number"
                  placeholder="120"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  min="0"
                  max="300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diastolic" className="text-sm text-muted-foreground">
                  ตัวล่าง (Diastolic)
                </Label>
                <Input
                  id="diastolic"
                  type="number"
                  placeholder="80"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  min="0"
                  max="200"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weight">น้ำหนัก (กก.)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                step="0.1"
                min="0"
                max="500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodSugar">ระดับน้ำตาล (mg/dL)</Label>
              <Input
                id="bloodSugar"
                type="number"
                placeholder="95"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value)}
                min="0"
                max="600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">อาการเพิ่มเติม</Label>
            <Textarea
              id="notes"
              placeholder="วันนี้มีอาการ... (ถ้ามี)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg">
          บันทึกข้อมูล
        </Button>
      </form>
    </Card>
  )
}
