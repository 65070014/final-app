"use client"
import { useEffect, useState, } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Appointment } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    addMonths, setMonth, setYear
} from "date-fns";
import { toast } from "sonner"
import { AppointmentCalendar } from "@/components/calendar"
import { useSession } from "next-auth/react";

export function CalendarDashboard() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const { data: session, status } = useSession();
    const [, setEditingAppointmentId] = useState(null)
    const [, setIsLoading] = useState(true)


    const [currentDate, setCurrentDate] = useState(new Date());

    const months = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);


    const fetchAppointments = async () => {
        if (status !== "authenticated" || !session?.user?.id) {
            return;
        }
        setIsLoading(true);

        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const params: Record<string, string> = {
            startDate: format(calendarStart, "yyyy-MM-dd"),
            endDate: format(calendarEnd, "yyyy-MM-dd"),
        };

        if (session?.user?.id) {
            params.patientId = session.user.id;
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
        if (status === "authenticated") {
            fetchAppointments();
        }
    }, [currentDate, status]);


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
                body: JSON.stringify({ patient_status: "Confirmed" })
            });
            if (!res.ok) throw new Error('ไม่สามารถยืนยันได้');
            setAppointments(prev => prev.map(appt => appt.id === id ? { ...appt, patient_status: "Confirmed" } : appt));
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

    const handleReschedule = async (id: number, selectedDate: string | undefined, selectedTime: string | undefined) => {
        if (!selectedDate || !selectedTime) return alert("กรุณาเลือกข้อมูลให้ครบ");
        try {
            const res = await fetch(`/api/appointments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: selectedDate, time: selectedTime, status: "Pending" })
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
            <AppointmentCalendar appointments={appointments} deleteAppointment={deleteAppointment} confirmAppointment={confirmAppointment} handleReschedule={handleReschedule} currentDate={currentDate} type="Patient" />
        </div>
    )
}