"use client"
import { useEffect, useState } from "react"
import { Edit, Trash2, CheckCircle } from "lucide-react"
import { Appointment } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function NurseDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")

  const timeSlots = Array.from({ length: 10 }, (_, i) => { 
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/appointments")
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ")
        const data = await res.json()
        setAppointments(data)
      } catch (err) {
        console.error("Error fetching appointments:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAppointments()
  }, [])

  const confirmAppointment = async (id: number) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "Confirmed" })
      });

      if (!res.ok) {
        throw new Error('ไม่สามารถยืนยันการนัดหมายได้');
      }
      setAppointments(prev =>
        prev.map(appt =>
          appt.id === id ? { ...appt, status: "Confirmed" } : appt
        )
      )
    } catch (err) {
      console.error("Confirmation failed:", err);
      alert((err as Error).message);
    }
  }

  const deleteAppointment = async (id: number) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบการนัดหมายนี้?')) {
      return;
    }
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'ไม่สามารถลบการนัดหมายได้');
      }
      setAppointments(prev => prev.filter(appt => appt.id !== id));
    } catch (err) {
      console.error("Deletion failed:", err);
      alert((err as Error).message);
    }
  }

  const handleEditClick = (appointment: Appointment) => {
    setEditingAppointmentId(appointment.id);
    setSelectedDate("");
    setSelectedTime("");
  };

  const handleCancelEdit = () => {
    setEditingAppointmentId(null);
  };

  const handleReschedule = async (id: number) => {
    if (!selectedDate || !selectedTime) {
      alert("กรุณาเลือกวันที่และเวลาใหม่");
      return;
    }
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, time: selectedTime, patient_status: "Pending"  })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'ไม่สามารถเลื่อนนัดหมายได้');
      }

      const newDateObj = new Date(selectedDate);
      const formattedDate = newDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/ /g, ' ');

      setAppointments(prev =>
        prev.map(appt =>
          appt.id === id ? { ...appt, date: formattedDate, time: `${selectedTime} น.`, patient_status: "Pending" } : appt
        )
      );
      handleCancelEdit();
    } catch (err) {
      console.error("Reschedule failed:", err);
      alert((err as Error).message);
    }
  };
  if (isLoading) return <div className="p-4">กำลังโหลดข้อมูล...</div>

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">การนัดหมายทั้งหมด</h2>
        <div className="space-y-4">
          {appointments.map(appt => (
            <div key={appt.id} className="border rounded-lg transition-all duration-300">
              <div className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium p-1">{appt.patient}</p>
                  <p className="text-sm p-1">{appt.date} | {appt.time} | {appt.department}</p>
                  <p className="font-medium p-1">แพทย์: {appt.doctorname} </p>
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    <p>สถานะฝั่งคนไข้: <span className={`px-3 py-1 rounded-full text-xs ${appt.patient_status === "Confirmed" ? "bg-green-200 text-green-700" : "bg-yellow-200 text-yellow-700"}`}>{appt.patient_status}</span></p>
                    <p className="mt-2">สถานะฝั่งแพทย์: <span className={`px-3 py-1 rounded-full text-xs ${appt.status === "Confirmed" || appt.status === "Complete" ? "bg-green-200 text-green-700" : "bg-yellow-200 text-yellow-700"}`}>{appt.status}</span></p>
                  </div>

                  {appt.status !== "Confirmed" && appt.status !== "Complete" && (
                    <Button size="icon" variant="outline" onClick={() => confirmAppointment(appt.id)} className="bg-blue-600 text-white hover:bg-blue-700"><CheckCircle className="w-4 h-4" /></Button>
                  )}
                  <Button size="icon" onClick={() => handleEditClick(appt)} className="bg-yellow-500 text-white hover:bg-yellow-600"><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" onClick={() => deleteAppointment(appt.id)} className="bg-red-600 text-white hover:bg-red-700"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>

              {editingAppointmentId === appt.id && (
                <div className="p-4 border-t bg-gray-50 dark:bg-gray-700 space-y-4 animate-in fade-in-50 duration-300">
                  <h3 className="font-medium text-foreground">เลื่อนนัดหมาย</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-date">เลือกวันที่ใหม่</Label>
                      <input type="date" id="new-date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-gray-800" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-time">เลือกเวลา</Label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger id="new-time" className="w-full">
                          <SelectValue placeholder="เลือกช่วงเวลา" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time} น.
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={handleCancelEdit}>ยกเลิก</Button>
                    <Button onClick={() => handleReschedule(appt.id)} disabled={!selectedDate || !selectedTime}>
                      ยืนยันการเลื่อนนัด
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}