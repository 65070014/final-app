"use client"
import { useState, useMemo } from "react"
import { Edit, Trash2, CheckCircle, User, Clock, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    addDays, isSameMonth, isSameDay,
} from "date-fns";

export function AppointmentCalendar({ appointments, deleteAppointment, confirmAppointment, handleReschedule, currentDate, type }) {
    const [editingAppointmentId, setEditingAppointmentId] = useState(null)
    const [selectedDate, setSelectedDate] = useState("")
    const [selectedTime, setSelectedTime] = useState("")
    const timeSlots = Array.from({ length: 12 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);


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
        }, {});
    }, [appointments]);

    const getApptsForDay = (day) => {
        const key = format(day, "yyyy-MM-dd");
        return groupedAppointments[key] || [];
    };

    const handleEditClick = (appointment) => {
        setEditingAppointmentId(appointment.id);
        try {
            const dateObj = new Date(appointment.date);
            if (!isNaN(dateObj.getTime())) {
                setSelectedDate(format(dateObj, "yyyy-MM-dd"));
            } else {
                setSelectedDate("");
            }
        } catch (e) {
            setSelectedDate("");
        }
        setSelectedTime(appointment.time.substring(0, 5));
    };

    return (
        <div>
            <div className="grid grid-cols-7 text-center font-semibold bg-blue-50 border border-blue-100 rounded-t-lg py-3">
                {["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"].map((d) => (
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
                                                    ${(type === 'Patient' ? a.patient_status : a.status) === 'Confirmed'
                                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                                    }`}

                                            >
                                                <span className="font-bold whitespace-nowrap">{a.time.substring(0, 5)}</span>
                                                <span className="truncate">{a.patient}</span>
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-0" align="start">
                                            <div className="bg-white rounded-md overflow-hidden">
                                                <div className="bg-gray-100 p-3 border-b flex justify-between items-center">
                                                    <span className="font-bold flex items-center gap-2">
                                                        <Clock className="w-4 h-4" /> {a.time} น.
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded ${(type === 'Patient' ? a.patient_status : a.status) === 'Confirmed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                                        {type === 'Patient' ? a.patient_status : a.status}
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
                                                                <Button size="sm" onClick={() => handleReschedule(a.id, selectedDate, selectedTime)}>บันทึก</Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                                    <User className="w-4 h-4" /> {a.patient}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                                    <MapPin className="w-4 h-4" /> {a.department}
                                                                </div>
                                                                <div className="text-sm text-gray-500 ml-6">
                                                                    แพทย์: {a.doctorname}
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                                                                {((type === 'Patient' ? a.patient_status : a.status) !== 'Confirmed') && (
                                                                    <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => confirmAppointment(a.id)}>
                                                                        <CheckCircle className="w-4 h-4 mr-1" /> ยืนยัน
                                                                    </Button>
                                                                )}
                                                                <Button size="sm" variant="ghost" onClick={() => handleEditClick(a)}>
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => deleteAppointment(a.id)}>
                                                                    <Trash2 className="w-4 h-4" />
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
    )
}