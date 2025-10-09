"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Doctor {
  id: string;
  name: string;
}

export function AppointmentForm() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    doctorId: "",
    department: "",
    symptoms: "",
    patient_status: "Confirmed",
    status: "Pending",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isDoctorsLoading, setIsDoctorsLoading] = useState(true);
  const [doctorError, setDoctorError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const response = await fetch('/api/doctors');

        if (!response.ok) {
          throw new Error('ไม่สามารถดึงรายชื่อแพทย์ได้');
        }

        const data = await response.json();
        setDoctors(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setDoctorError(error.message);
        console.error("Error fetching doctors:", error);
      } finally {
        setIsDoctorsLoading(false);
      }
    }
    fetchDoctors();
  }, []);

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30",
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (status !== 'authenticated' || !session?.user?.id) {
      setError("ไม่พบข้อมูลผู้ใช้ โปรดล็อกอินใหม่");
      return;
    }

    if (!formData.date || !formData.time || !formData.symptoms) {
      setError("กรุณากรอกข้อมูล วันที่, เวลา, และอาการ ให้ครบถ้วน");
      return;
    }

    setIsLoading(true)

    const appointmentData = {
      ...formData,
      patientId: session.user.id,
    }

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ไม่สามารถบันทึกนัดหมายได้');
      }

      alert("บันทึกนัดหมายสำเร็จ!");
      router.push("/patient");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Appointment submission failed:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">สร้างนัดหมายใหม่</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Date Input */}
        <Input
          type="date"
          id="date"
          placeholder="เลือกวันที่"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <Select
          value={formData.time}
          onValueChange={(value) => setFormData({ ...formData, time: value })}
          required
        >
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

        <Select
          value={formData.doctorId}
          onValueChange={(value) => setFormData({ ...formData, doctorId: value })}
          required
          disabled={isDoctorsLoading || !!doctorError}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={
              isDoctorsLoading ? "กำลังโหลดแพทย์..." :
                doctorError ? "เกิดข้อผิดพลาดในการโหลด" :
                  "เลือกแพทย์"
            } />
          </SelectTrigger>
          <SelectContent className="w-full">
            {doctors.length === 0 && !isDoctorsLoading && (
              <SelectItem value="" disabled>ไม่พบรายชื่อแพทย์</SelectItem>
            )}
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                {doctor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="text"
          id="department"
          placeholder="แผนก (เช่น อายุรกรรม)"
          value={formData.department}
          onChange={handleChange}
        />

        <Textarea
          id="symptoms"
          placeholder="อาการโดยละเอียด"
          rows={3}
          value={formData.symptoms}
          onChange={handleChange}
          required
        />

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? 'กำลังบันทึก...' : 'บันทึกนัดหมาย'}
        </Button>
      </form>
    </Card>
  )
}
