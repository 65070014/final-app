"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Label } from "@radix-ui/react-label"
import { Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar"
import { format, parse, isValid, isBefore, startOfDay } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function AppointmentForm() {
  const [bookedTimes, setBookedTimes] = useState([])
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
  const [doctors, setDoctors] = useState([]);
  const [isDoctorsLoading, setIsDoctorsLoading] = useState(true);
  const [doctorError, setDoctorError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const response = await fetch('/api/doctors');

        if (!response.ok) {
          throw new Error('ไม่สามารถดึงรายชื่อแพทย์ได้');
        }

        const data = await response.json();
        setDoctors(data);
      } catch (error) {
        setDoctorError(error.message);
        console.error("Error fetching doctors:", error);
      } finally {
        setIsDoctorsLoading(false);
      }
    }
    fetchDoctors();
  }, []);
  const departments = [
    "อายุรกรรม", "ศัลยกรรม", "กุมารเวชกรรม", "โสต ศอ นาสิก", "ทันตกรรม", "สูติ–นรีเวชกรรม",
    "จิตเวช", "อายุรกรรมโรคระบบทางเดินหายใจ", "หัวใจ", "ผิวหนัง", "เวชศาสตร์ฟื้นฟู", "ตรวจสุขภาพ / เวชศาสตร์ป้องกัน"
  ]
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30","20:00",
  ]


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }
  const handleSubmit = async (e) => {
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

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'ไม่สามารถบันทึกนัดหมายได้');
        return;
      }

      alert("บันทึกนัดหมายสำเร็จ!");
      router.push("/patient");

    } catch (err) {
      console.error("Appointment submission failed:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoading(false)
    }
  }

  const today = startOfDay(new Date())

  const handleInputChange = (value) => {
    setError("")

    const numbers = value.replace(/\D/g, "").slice(0, 8)

    let formatted = numbers

    if (numbers.length > 4) {
      formatted = `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`
    } else if (numbers.length > 2) {
      formatted = `${numbers.slice(0, 2)}/${numbers.slice(2)}`
    }

    setInputValue(formatted)

    if (numbers.length === 8) {
      const parsed = parse(formatted, "dd/MM/yyyy", new Date())

      if (!isValid(parsed)) {
        setError("รูปแบบวันที่ไม่ถูกต้อง")
        return
      }

      if (isBefore(parsed, today)) {
        setError("ไม่สามารถเลือกวันย้อนหลังได้")
        return
      }

      setSelectedDate(parsed)
    }
  }


  useEffect(() => {
    if (!selectedDate) return;

    const fetchBooked = async () => {
      try {
        const res = await fetch(
          `/api/appointments/confirmapt?date=${format(selectedDate, "yyyy-MM-dd")}&doctorId=${formData.doctorId}`
        );

        const data = await res.json();

        if (!res.ok) {
          setBookedTimes([]);
          return;
        }

        setBookedTimes(data.map(item => item.time));

      } catch (err) {
        setBookedTimes([]);
      }
    };

    fetchBooked();
  }, [selectedDate, formData.doctorId]);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-11 px-8 text-base">
          <Plus size={20} />
          สร้างนัดหมายใหม่
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-visible">
        <DialogHeader>
          <DialogTitle className="text-[1.50rem] font-bold text-blue-700">สร้างนัดหมายใหม่</DialogTitle>
        </DialogHeader>

        {error && <p className="text-red-500 ">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="date">วันที่นัดหมาย</Label>
              <Popover modal={false}>
                <PopoverTrigger asChild>
                  <div className="w-full">
                    <Input
                      placeholder="dd/mm/yyyy"
                      value={inputValue}
                      onChange={(e) => handleInputChange(e.target.value)}
                    />
                  </div>
                </PopoverTrigger>

                <PopoverContent
                  className="w-auto p-0 z-[9999]"
                  align="start"
                >

                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date)
                      setInputValue(format(date, "dd/MM/yyyy"))
                      if (date) {
                        setFormData({
                          ...formData,
                          date: format(date, "yyyy-MM-dd"),
                        })
                      }
                    }}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))

                    }
                    components={{
                      IconLeft: () => (
                        <ChevronLeft className="h-4 w-4" />
                      ),
                      IconRight: () => (
                        <ChevronRight className="h-4 w-4" />
                      ),
                    }}
                    className="rounded-xl border shadow-md p-3"
                    classNames={{
                      months: "space-y-4",
                      month: "space-y-4",

                      caption_label:
                        "text-base font-semibold text-gray-800",

                      table: "w-full border-collapse",
                      head_row: "flex",
                      head_cell:
                        "text-gray-500 rounded-md w-9 font-medium text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: "h-9 w-9 text-center text-sm p-0 relative",
                      day: "h-9 w-9 p-0 font-normal hover:bg-blue-100 rounded-md transition",
                      day_selected:
                        "bg-blue-600 text-white hover:bg-blue-600 focus:bg-blue-600",
                      day_today: "border border-blue-500",
                      day_disabled: "text-gray-300 opacity-50",
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <Label>ช่วงเวลา</Label>
              <Select
                value={formData.time}
                onValueChange={(value) => setFormData({ ...formData, time: value })}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกช่วงเวลา" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem
                      key={time}
                      value={time}
                      disabled={bookedTimes.includes(time)}
                    >{time} น.</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>แพทย์ที่ต้องการนัดหมาย</Label>
              <Select
                value={formData.doctorId}
                onValueChange={(value) => setFormData({ ...formData, doctorId: value })}
                required
                disabled={isDoctorsLoading || !!doctorError}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isDoctorsLoading ? "กำลังโหลด..." : "เลือกแพทย์"} />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>{doctor.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="department">แผนก</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกแผนก" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dep) => (
                    <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="symptoms">อาการโดยละเอียด (จำเป็น)</Label>
            <Textarea
              id="symptoms"
              placeholder="กรุณาอธิบายอาการ..."
              rows={3}
              value={formData.symptoms}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            {/* ปุ่มยกเลิก (กดแล้วปิด Modal) */}
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>

            {/* ปุ่มบันทึก */}
            <Button className="bg-blue-600 hover:bg-blue-700" type="submit" disabled={isLoading}>
              {isLoading ? 'กำลังบันทึก...' : 'บันทึกนัดหมาย'}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog >
  )
}
