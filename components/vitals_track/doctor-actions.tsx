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
  onUpdateMonitoringDate?: (newDate: Date) => void
  onCloseMonitoring?: () => void
}

export function DoctorActions({ patient, onUpdateMonitoringDate, onCloseMonitoring }: DoctorActionsProps) {
  const [soapNote, setSoapNote] = useState("")
  const [newEndDate, setNewEndDate] = useState(format(patient.monitoringEndDate, "yyyy-MM-dd"))
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false)
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)

  const handleSaveNote = () => {
    if (!soapNote.trim()) {
      toast.error("กรุณากรอกบันทึก", {
        description: "กรุณากรอกข้อมูลบันทึกการวิเคราะห์และแผนการรักษา",
      })
      return
    }

    // In a real app, this would save to the database
    toast.success("บันทึกสำเร็จ", {
      description: "บันทึกการวิเคราะห์และแผนการรักษาเรียบร้อยแล้ว",
    })
    setSoapNote("")
  }

  const handleExtendMonitoring = () => {
    const date = new Date(newEndDate)
    onUpdateMonitoringDate?.(date)
    setIsExtendDialogOpen(false)
    toast.success("ขยายเวลาสำเร็จ", {
      description: `ขยายเวลาติดตามผลถึง ${format(date, "dd MMMM yyyy", { locale: th })}`,
    })
  }

  const handleCloseMonitoring = () => {
    onCloseMonitoring?.()
    setIsCloseDialogOpen(false)
    toast.success("จบการติดตามผล", {
      description: "เปลี่ยนสถานะผู้ป่วยเป็น CLOSED เรียบร้อยแล้ว",
    })
  }

  const handleContactPatient = (type: "video" | "chat") => {
    toast(type === "video" ? "เริ่มการโทรวิดีโอ" : "เปิดแชท", {
      description: `กำลังเชื่อมต่อกับ ${patient.name}...`,
    })
  }

  return (
    <div className="space-y-4">
      {/* Quick Contact Actions */}
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

      {/* SOAP Note */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">บันทึกการวิเคราะห์และแผนการรักษา (SOAP Note)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="กรอกบันทึกการวิเคราะห์อาการ (Analysis) และแผนการรักษา (Plan)..."
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

      {/* Monitoring Management */}
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
