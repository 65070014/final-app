"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Video, Calendar, CheckCircle, Save } from "lucide-react"
import type { Patient } from "@/lib/types"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { toast } from "sonner"

interface DoctorActionsProps {
  patient: Patient
}

export function DoctorActions({ patient }: DoctorActionsProps) {
  const [soapNote, setSoapNote] = useState("")
  const [newEndDate, setNewEndDate] = useState(format(patient.monitoringEndDate, "yyyy-MM-dd"))
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false)
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)

  const handleSaveNote = async () => {
    try {
      if (!soapNote.trim()) {
        throw new Error("กรุณาบันทึกข้อมูลการวิเคราะห์และแผนการรักษา");
      }

      const response = await fetch('/api/monitoring_log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosisId: patient.diag_id,
          medPersonnelId: 1,
          analysisPlanNote: soapNote,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `บันทึกไม่สำเร็จ (Status: ${response.status})`);
      }

      const successData = await response.json();

      alert('บันทึกการติดตามผลสำเร็จ!');
      window.location.reload();

      return successData.logId; // คืนค่า ID Log ที่สร้างใหม่

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to save monitoring log:", error);

    }
  }

  const handleExtendMonitoring = async () => {
    try {
      if (!newEndDate) {
        throw new Error("กรุณาระบุวันที่สิ้นสุดการติดตามใหม่");
      }
      const response = await fetch('/api/monitoring', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: patient.app_id,
          isMonitoring: true,
          monitoringEndDate: newEndDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `ไม่สามารถขยายระยะเวลาติดตามได้ (Status: ${response.status})`);
      }
      alert(`ขยายวันสิ้นสุดการติดตามเป็น ${newEndDate} สำเร็จ!`);
      window.location.reload();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to extend monitoring period:", error);
    }
  }

  const handleCloseMonitoring = async () => {
    try {
      const response = await fetch('/api/monitoring', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: patient.app_id,
          isMonitoring: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `ไม่สามารถยกเลิกการติดตามได้ (Status: ${response.status})`);
      }

      alert("ยกเลิกการติดตามสำเร็จ!");
      window.location.reload();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to close monitoring:", error);
    }
  }

  const handleContactPatient = (type: "video" | "chat") => {
    toast(type === "video" ? "เริ่มการโทรวิดีโอ" : "เปิดแชท", {
      description: `กำลังเชื่อมต่อกับ ${patient.name}...`,
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ติดต่อผู้ป่วย</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={() => handleContactPatient("video")} className="flex-1" variant="default">
            <Video className="mr-2 h-4 w-4" />
            โทรวิดีโอ
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">บันทึกการวิเคราะห์และแผนการรักษา</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="กรอกบันทึกการวิเคราะห์อาการ และแผนการรักษา"
            value={soapNote}
            onChange={(e) => setSoapNote(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <Button onClick={handleSaveNote} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            บันทึกเวชระเบียน
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">จัดการการติดตามผล</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Extend Monitoring Dialog */}
          <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full bg-transparent">
                <Calendar className="mr-2 h-4 w-4" />
                ขยายเวลาติดตามผล
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ขยายเวลาติดตามผล</DialogTitle>
                <DialogDescription>เปลี่ยนวันสิ้นสุดการติดตามผลสำหรับ {patient.name}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="current-end-date">วันสิ้นสุดปัจจุบัน</Label>
                  <Input
                    id="current-end-date"
                    value={format(patient.monitoringEndDate, "dd MMMM yyyy", { locale: th })}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-end-date">วันสิ้นสุดใหม่</Label>
                  <Input
                    id="new-end-date"
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsExtendDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleExtendMonitoring}>บันทึก</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Close Monitoring Dialog */}
          <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full bg-transparent">
                <CheckCircle className="mr-2 h-4 w-4" />
                จบการติดตามผล
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>จบการติดตามผล</DialogTitle>
                <DialogDescription>
                  คุณต้องการจบการติดตามผลสำหรับ {patient.name} ใช่หรือไม่?
                  <br />
                  <br />
                  การดำเนินการนี้จะเปลี่ยนสถานะผู้ป่วยจาก ACTIVE เป็น CLOSED และนำผู้ป่วยออกจากรายการติดตามผลหลัก
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button variant="destructive" onClick={handleCloseMonitoring}>
                  ยืนยันจบการติดตามผล
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
