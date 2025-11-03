"use client"
import { useEffect, useState, useMemo } from "react"
import { Edit, Trash2, CheckCircle, CalendarIcon, List } from "lucide-react"
import { Appointment } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { format } from "date-fns"; 
import { toast } from "sonner"
import { DateRange } from "react-day-picker"
import { DatePickerWithRange } from "@/components/ui/date-range-picker" 
import { th } from 'date-fns/locale';

export default function NurseDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(true)
  const [doctors, setDoctors] = useState<any[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const timeSlots = Array.from({ length: 10 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("/api/doctors");
        const data = await res.json();
        setDoctors(data);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      }
    };
    fetchDoctors();
  }, []);


  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      setHasSearched(true);

      const params: Record<string, string> = {};
      
      if (dateRange?.from) {
        params.startDate = format(dateRange.from, "yyyy-MM-dd");
      }
      if (dateRange?.to) {
        params.endDate = format(dateRange.to, "yyyy-MM-dd");
      } else if (dateRange?.from) {
        params.endDate = format(dateRange.from, "yyyy-MM-dd");
      }
      
      if (selectedDoctorId) {
        params.doctorId = selectedDoctorId;
      }

      if (!dateRange?.from && !selectedDoctorId) {
         setAppointments([]);
         setIsLoading(false);
         setHasSearched(false); 
         return;
      }
      
      const query = new URLSearchParams(params).toString();
      const url = `/api/appointments?${query}`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
        setAppointments(await res.json());
      } catch (err) {
        console.error(err);
        setAppointments([]);
        toast.error("เกิดข้อผิดพลาด", { description: (err as Error).message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [dateRange, selectedDoctorId]); 

  const groupedAppointments = useMemo(() => {
    return appointments.reduce((acc, appt) => {
      const dateKey = appt.date;
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(appt);
      return acc;
    }, {} as Record<string, Appointment[]>);
  }, [appointments]);
  
  const handleShowAll = async () => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching all appointments:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
        body: JSON.stringify({ date: selectedDate, time: selectedTime, patient_status: "Pending" })
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


  if (isLoading && hasSearched) return <div className="p-4">กำลังโหลดข้อมูล...</div>
  

  return (
    <div className="min-h-screen   p-4 sm:p-8 bg-blue-400  text-black">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 dark:text-gray-100">ตารางนัดหมาย</h2>

        <Card className="mb-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg shadow-lg  text-black ">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              ค้นหาการนัดหมาย
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap justify-center items-end gap-4 ">
            
            <div className="flex flex-col items-center gap-4  text-black">
              <Label className="mb-[-10px]">เลือกช่วงวันที่</Label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>

            <div className="flex items-end gap-2  text-black">
              <div className="flex flex-col">
                <Label className="mb-2">เลือกแพทย์</Label>
                <Select value={selectedDoctorId} onValueChange={(val) => setSelectedDoctorId(val === 'all' ? '' : val)}>
                  <SelectTrigger id="search-doctor" className="w-[180px]"><SelectValue placeholder="แพทย์ทั้งหมด" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">แพทย์ทั้งหมด</SelectItem>
                    {doctors.map((doc) => <SelectItem key={doc.id} value={String(doc.id)}>{doc.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleShowAll} variant="outline" disabled={isLoading}><List className="w-4 h-4 mr-2" /> {isLoading ? "..." : "แสดงทั้งหมด"}</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4  text-black ">
          {isLoading ? (<p className="text-center p-8 ">กำลังโหลดข้อมูล...</p>)
            : !hasSearched ? (<p className="text-center p-8text-black-500">กรุณาเลือกช่วงวันที่หรือแพทย์เพื่อค้นหา</p>)
            : appointments.length === 0 ? (<p className="text-center p-8text-black-500">ไม่พบการนัดหมายตามเงื่อนไขที่เลือก</p>)
            : (
              <div className="space-y-6">
                 {Object.keys(groupedAppointments).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).map(date => (
                      <div key={date}>
                        <h3 className="font-semibold text-lg mb-2 p-2 rounded-md sticky top-0">{format(new Date(date), "dd MMM yyyy", { locale: th })}</h3>
                        <div className="space-y-4">
                          {groupedAppointments[date].map(appt => (
                            <div key={appt.id} className="   border   bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg shadow-lg ">
                              <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                  <p className="font-medium text-lg p-1 text-black">{appt.patient}</p>
                                  <p className="text-sm p-1 text-black dark:text-gray-400">{format(new Date(appt.date), "dd MMM yyyy", { locale: th })} | {appt.time} | {appt.department}</p>
                                  <p className="font-medium p-1  text-black">แพทย์: {appt.doctorname}</p>
                                </div>
                                <div className="flex w-full sm:w-auto items-center justify-end flex-wrap gap-2">
                                  <div className="flex gap-2 items-center text-xs">
                                    <span className={`px-3 py-1 rounded-full ${appt.patient_status === "Confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>คนไข้: {appt.patient_status}</span>
                                    <span className={`px-3 py-1 rounded-full ${appt.status === "Confirmed" || appt.status === "Complete" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>รพ: {appt.status}</span>
                                  </div>
                                  <div className="flex gap-2 border-l pl-2 ml-2">
                                    {appt.status !== "Confirmed" && appt.status !== "Complete" && <Button size="icon" variant="outline" onClick={() => confirmAppointment(appt.id)} className="bg-blue-600 text-white hover:bg-blue-700"><CheckCircle className="w-4 h-4" /></Button>}
                                    <Button size="icon" variant="outline" onClick={() => handleEditClick(appt)} className="bg-yellow-500 text-white hover:bg-yellow-600"><Edit className="w-4 h-4" /></Button>
                                    <Button size="icon" variant="outline" onClick={() => deleteAppointment(appt.id)} className="bg-red-600 text-white hover:bg-red-700"><Trash2 className="w-4 h-4" /></Button>
                                  </div>
                                </div>
                              </div>
                              {editingAppointmentId === appt.id && (
                                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 space-y-4">
                                  <h3 className="font-medium">เลื่อนนัดหมาย</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><Label htmlFor="new-date">วันที่ใหม่</Label><input type="date" id="new-date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-2 border rounded-md" /></div>
                                    <div><Label htmlFor="new-time">เวลาใหม่</Label><Select value={selectedTime} onValueChange={setSelectedTime}><SelectTrigger id="new-time"><SelectValue placeholder="เลือกเวลา" /></SelectTrigger><SelectContent>{timeSlots.map((time) => (<SelectItem key={time} value={time}>{time} น.</SelectItem>))}</SelectContent></Select></div>
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" onClick={handleCancelEdit}>ยกเลิก</Button>
                                    <Button onClick={() => handleReschedule(appt.id)} disabled={!selectedDate || !selectedTime}>ยืนยัน</Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}