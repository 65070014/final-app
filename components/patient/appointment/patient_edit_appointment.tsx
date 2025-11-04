"use client"

import { useState } from "react"
import { Calendar, Clock, User, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Appointment } from "@/lib/types"
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface Patient_Edit_AppointmentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentData: Appointment;
}

type ActionType = "none" | "reschedule" | "cancel"

export function Patient_Edit_Appointment({
  open,
  onOpenChange,
  appointmentData
}: Patient_Edit_AppointmentProps) {
  const [selectedAction, setSelectedAction] = useState<ActionType>("none")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")

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

  const resetForm = () => {
    setSelectedAction("none")
    setSelectedDate("")
    setSelectedTime("")
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value;
    setSelectedDate(dateString);
  };

  const handleDelete = async (record: number) => {
    try {
      const response = await fetch(`/api/appointments/${record}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_status: 'Cancelled' }),
      });

      if (!response.ok) {
        throw new Error('ยืนยันไม่สำเร็จ');
      }

    } catch (error) {
      console.error('Confirm error:', error);
    } finally {
      window.location.reload();
    }
  };

  const handleReschedule = async (record: number) => {
    try {
      const response = await fetch(`/api/appointments/${record}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({selectedDate, selectedTime}),
      });

      if (!response.ok) {
        throw new Error('ยืนยันไม่สำเร็จ');
      }

    } catch (error) {
      console.error('Confirm error:', error);
    } finally {
      window.location.reload();
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-balance">จัดการนัดหมาย</DialogTitle>
          <DialogDescription className="text-base">เลือกการดำเนินการที่ต้องการสำหรับนัดหมายของคุณ</DialogDescription>
        </DialogHeader>

        {/* Appointment Summary */}
        <div className="bg-secondary/50 rounded-lg p-4 space-y-3 border border-border">
          <h3 className="font-medium text-sm text-muted-foreground">รายละเอียดนัดหมายปัจจุบัน</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-foreground">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium">{appointmentData.doctorname}</span>
              <span className="text-sm text-muted-foreground">{appointmentData.department}</span>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{format(new Date(appointmentData.date), "dd MMM yyyy", { locale: th })}</span>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>{appointmentData.time}</span>
            </div>
          </div>
        </div>

        {/* Action Selection */}
        {selectedAction === "none" && (
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">เลือกการดำเนินการ</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                size="lg"
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors bg-transparent"
                onClick={() => setSelectedAction("reschedule")}
              >
                <Calendar className="h-5 w-5" />
                <span className="font-medium">เลื่อนนัด</span>
                <span className="text-xs opacity-80 font-normal">เปลี่ยนวันหรือเวลา</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors bg-transparent"
                onClick={() => setSelectedAction("cancel")}
              >
                <X className="h-5 w-5" />
                <span className="font-medium">ยกเลิกนัด</span>
                <span className="text-xs opacity-80 font-normal">ยกเลิกนัดหมายนี้</span>
              </Button>
            </div>
          </div>
        )}

        {/* Reschedule Form */}
        {selectedAction === "reschedule" && (
          <div className="space-y-4 animate-in fade-in-50 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">เลื่อนนัดหมาย</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedAction("none")}>
                ← กลับ
              </Button>
            </div>


            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="dob" className="block text-sm font-medium mb-1">เลือกวันที่ใหม่</label>
                <input type="date" id="dob" name="dob" value={selectedDate} onChange={handleDateChange} className="w-full p-2 border rounded-md" />
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

              <Button
                className="w-full"
                size="lg"
                disabled={!selectedDate || !selectedTime}
                onClick={() => handleReschedule(appointmentData.id)}
              >
                ยืนยันการเลื่อนนัด
              </Button>
            </div>
          </div>
        )}

        {/* Cancel Form */}
        {selectedAction === "cancel" && (
          <div className="space-y-4 animate-in fade-in-50 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">ยกเลิกนัดหมาย</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedAction("none")}>
                ← กลับ
              </Button>
            </div>

            <Alert variant="destructive" className="bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm leading-relaxed">
                <strong>คำเตือน:</strong> นัดหมายนี้จะถูกยกเลิกอย่างถาวร
                กรุณาพิจารณาอย่างรอบคอบก่อนดำเนินการ
              </AlertDescription>
            </Alert>

            <Button onClick={() => handleDelete(appointmentData.id)} variant="destructive" className="w-full" size="lg">
              ยืนยันการยกเลิกนัด
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t">
          <Button variant="ghost" onClick={handleClose}>
            ปิด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
