"use client"
import { useEffect, useState, useMemo } from "react"
import { Edit, Trash2, CheckCircle, CalendarIcon, ChevronLeft, ChevronRight, User, Clock, MapPin } from "lucide-react"
import { Appointment } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  addMonths, addDays, isSameMonth, isSameDay, setMonth, setYear
} from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner"

export default function NurseDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [doctors, setDoctors] = useState<any[]>([])

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  
  const timeSlots = Array.from({ length: 12 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i); 

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

  const fetchAppointments = async () => {
    setIsLoading(true);
    
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const params: Record<string, string> = {
      startDate: format(calendarStart, "yyyy-MM-dd"),
      endDate: format(calendarEnd, "yyyy-MM-dd"),
    };
    
    if (selectedDoctorId) {
      params.doctorId = selectedDoctorId;
    }

    const query = new URLSearchParams(params).toString();
    const url = `/api/appointments?${query}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error(err);
      setAppointments([]);
      toast.error("เกิดข้อผิดพลาด", { description: (err as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentDate, selectedDoctorId]);

  const groupedAppointments = useMemo(() => {
    return appointments.reduce((acc, appt) => {
        let dateKey = appt.date; 
        try {
            const dateObj = new Date(appt.date);
            if (!isNaN(dateObj.getTime())) {
                dateKey = format(dateObj, "yyyy-MM-dd");
            }
        } catch (e) {
            console.warn("Date parsing error:", appt.date);
        }

        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(appt);
        return acc;
    }, {} as Record<string, Appointment[]>);
  }, [appointments]);

  const getApptsForDay = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    return groupedAppointments[key] || [];
  };

  const handleMonthChange = (monthIndex: string) => {
    const newDate = setMonth(currentDate, parseInt(monthIndex));
    setCurrentDate(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = setYear(currentDate, parseInt(year));
    setCurrentDate(newDate);
  };

  const confirmAppointment = async (id: number) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "Confirmed" })
      });
      if (!res.ok) throw new Error('ไม่สามารถยืนยันได้');
      setAppointments(prev => prev.map(appt => appt.id === id ? { ...appt, status: "Confirmed" } : appt));
      toast.success("ยืนยันนัดหมายเรียบร้อย");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const deleteAppointment = async (id: number) => {
    if (!window.confirm('ยืนยันการลบ?')) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('ลบไม่สำเร็จ');
      setAppointments(prev => prev.filter(appt => appt.id !== id));
      toast.success("ลบนัดหมายเรียบร้อย");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const handleEditClick = (appointment: Appointment) => {
    setEditingAppointmentId(appointment.id);
    try {
        const dateObj = new Date(appointment.date);
        if(!isNaN(dateObj.getTime())){
             setSelectedDate(format(dateObj, "yyyy-MM-dd"));
        } else {
             setSelectedDate("");
        }
    } catch(e) {
        setSelectedDate("");
    }
    setSelectedTime(appointment.time.substring(0, 5)); 
  };

  const handleReschedule = async (id: number) => {
    if (!selectedDate || !selectedTime) return alert("กรุณาเลือกข้อมูลให้ครบ");
    try {
       const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, time: selectedTime, patient_status: "Pending" })
      });
      if (!res.ok) throw new Error('เลื่อนนัดไม่สำเร็จ');
      
      fetchAppointments(); 
      setEditingAppointmentId(null);
      toast.success("เลื่อนนัดหมายเรียบร้อย");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-blue-400 text-black font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-6">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                ตารางนัดหมาย
            </h2>
            
            <div className="flex gap-2 w-full md:w-auto">
                <Select value={selectedDoctorId} onValueChange={(val) => setSelectedDoctorId(val === 'all' ? '' : val)}>
                    <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="แพทย์ทั้งหมด" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">แพทย์ทั้งหมด</SelectItem>
                        {doctors.map((doc) => <SelectItem key={doc.id} value={String(doc.id)}>{doc.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>

        {/* --- ส่วนปฏิทิน --- */}
        <div className="space-y-4 text-black border rounded-lg p-4 bg-gray-50 shadow-sm">
            <div className="flex justify-between items-center bg-white p-2 rounded border">
                <button
                    onClick={() => setCurrentDate(addMonths(currentDate, -1))}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>

                <div className="flex gap-2 items-center">
                    {/* เลือกเดือน */}
                    <Select 
                        value={currentDate.getMonth().toString()} 
                        onValueChange={handleMonthChange}
                    >
                        <SelectTrigger className="w-[140px] font-bold text-gray-800 border-none shadow-none hover:bg-gray-100 focus:ring-0">
                            <SelectValue>{months[currentDate.getMonth()]}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((m, i) => (
                                <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* เลือกปี */}
                    <Select 
                        value={currentDate.getFullYear().toString()} 
                        onValueChange={handleYearChange}
                    >
                        <SelectTrigger className="w-[100px] font-bold text-gray-800 border-none shadow-none hover:bg-gray-100 focus:ring-0">
                            <SelectValue>{currentDate.getFullYear()}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((y) => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <button
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            <div className="grid grid-cols-7 text-center font-semibold bg-blue-50 border border-blue-100 rounded-t-lg py-3">
                {["จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์","อาทิตย์"].map((d) => (
                    <div key={d} className="text-blue-800">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 bg-white border-l border-b">
                {(() => {
                    const monthStart = startOfMonth(currentDate);
                    const monthEnd = endOfMonth(currentDate);
                    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
                    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

                    const days = [];
                    let day = calendarStart;

                    while (day <= calendarEnd) {
                        days.push(new Date(day));
                        day = addDays(day, 1);
                    }

                    return days.map((day, idx) => {
                        const appts = getApptsForDay(day); 
                        const isToday = isSameDay(day, new Date());
                        const isCurrentMonth = isSameMonth(day, currentDate);

                        return (
                            <div
                                key={idx}
                                className={`
                                    border-r border-t p-2 min-h-[120px] text-xs relative flex flex-col gap-1 transition-colors
                                    ${!isCurrentMonth ? "bg-gray-50/50 text-gray-400" : "bg-white"}
                                    hover:bg-blue-50/30
                                `}
                            >
                                <div className={`
                                    font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full
                                    ${isToday ? "bg-blue-600 text-white shadow-sm" : ""}
                                `}>
                                    {format(day, "d")}
                                </div>

                                {/* รายการนัด */}
                                {appts.map((a) => (
                                    <Popover key={a.id}>
                                        <PopoverTrigger asChild>
                                            <div
                                                className={`
                                                    px-2 py-1.5 rounded mb-0.5 truncate cursor-pointer shadow-sm border flex items-center gap-1
                                                    ${a.status === 'Confirmed' 
                                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'}
                                                `}
                                            >
                                                <span className="font-bold whitespace-nowrap">{a.time.substring(0,5)}</span> 
                                                <span className="truncate">{a.patient}</span>
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-0" align="start">
                                            <div className="bg-white rounded-md overflow-hidden">
                                                <div className="bg-gray-100 p-3 border-b flex justify-between items-center">
                                                    <span className="font-bold flex items-center gap-2">
                                                        <Clock className="w-4 h-4"/> {a.time} น.
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded ${a.status === 'Confirmed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                                        {a.status}
                                                    </span>
                                                </div>
                                                
                                                <div className="p-4 space-y-3">
                                                    {editingAppointmentId === a.id ? (
                                                        <div className="space-y-3">
                                                            <div className="font-bold text-gray-700 border-b pb-1">แก้ไขวันเวลา</div>
                                                            <div>
                                                                <Label>วันที่</Label>
                                                                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full border rounded p-1 text-sm mt-1" />
                                                            </div>
                                                            <div>
                                                                <Label>เวลา</Label>
                                                                <Select value={selectedTime} onValueChange={setSelectedTime}>
                                                                    <SelectTrigger className="h-8 mt-1"><SelectValue placeholder="เลือกเวลา" /></SelectTrigger>
                                                                    <SelectContent className="max-h-[200px]">
                                                                        {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="flex justify-end gap-2 pt-2">
                                                                <Button size="sm" variant="ghost" onClick={() => setEditingAppointmentId(null)}>ยกเลิก</Button>
                                                                <Button size="sm" onClick={() => handleReschedule(a.id)}>บันทึก</Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                                    <User className="w-4 h-4"/> {a.patient}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                                    <MapPin className="w-4 h-4"/> {a.department}
                                                                </div>
                                                                <div className="text-sm text-gray-500 ml-6">
                                                                    แพทย์: {a.doctorname}
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                                                                {a.status !== "Confirmed" && (
                                                                    <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => confirmAppointment(a.id)}>
                                                                        <CheckCircle className="w-4 h-4 mr-1"/> ยืนยัน
                                                                    </Button>
                                                                )}
                                                                <Button size="sm" variant="ghost" onClick={() => handleEditClick(a)}>
                                                                    <Edit className="w-4 h-4"/>
                                                                </Button>
                                                                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => deleteAppointment(a.id)}>
                                                                    <Trash2 className="w-4 h-4"/>
                                                                </Button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                ))}
                            </div>
                        );
                    });
                })()}
            </div>
        </div>

      </div>
    </div>
  )
}