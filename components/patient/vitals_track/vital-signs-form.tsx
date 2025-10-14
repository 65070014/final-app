"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { VitalRecord } from "@/lib/types"
import { useSession } from "next-auth/react"


export function VitalSignsForm({ id }: { id: string }) {
  const [systolic, setSystolic] = useState<string>("")
  const [diastolic, setDiastolic] = useState<string>("")
  const [weight, setWeight] = useState<string>("")
  const [temp, setTemp] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const record: Omit<VitalRecord, "id"> = {
      systolic: systolic ? Number(systolic) : undefined,
      diastolic: diastolic ? Number(diastolic) : undefined,
      weight: weight ? Number(weight) : undefined,
      temp: temp ? Number(temp) : undefined,
      notes: notes.trim() || undefined,
      date: "",
      time: ""
    }

    setError("")

    if (!session?.user?.id) {
      setError("ไม่พบข้อมูลผู้ใช้ โปรดล็อกอินใหม่");
      return;
    }

    const vitalsSignsData = {
      ...record,
      appointmentId: id,
      patientId: session.user.id
    }

    try {
      const response = await fetch('/api/patients/vitals_track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vitalsSignsData),
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ไม่สามารถบันทึกนัดหมายได้');
      }

      alert("บันทึกข้อมูลสุขภาพเสร็จสิ้น");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Appointment submission failed:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSystolic("")
      setDiastolic("")
      setWeight("")
      setTemp("")
      setNotes("")
      }
  }
  

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">บันทึกข้อมูลล่าสุด</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="temp">อุณหภูมิร่างกาย</Label>
              <Input
                id="temp"
                type="number"
                placeholder="35"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                min="0"
                max="60"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">อาการเพิ่มเติม</Label>
            <Textarea
              id="notes"
              placeholder="วันนี้มีอาการ..."
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
