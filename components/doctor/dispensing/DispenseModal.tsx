"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface DispenseModalProps {
  open: boolean
  onClose: () => void
  patientId?: number 
  medicalPersonnelId?: number 
}
export default function DispenseModal({ open, onClose, patientId, medicalPersonnelId }: DispenseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    drugName: "",
    strength: "",
    usage: "",
    quantity: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!patientId || !medicalPersonnelId) {
        setError("ไม่พบข้อมูลผู้ป่วยหรือแพทย์");
        return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
        const response = await fetch('/api/prescription_medication', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                patientId: patientId,
                medicalPersonnelId: medicalPersonnelId,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }

        console.log("จ่ายยาสำเร็จ:", await response.json());
        alert("บันทึกนัดการจ่ายยาสำเร็จ!");
        handleClose();
    } catch (err: any) {
        console.error(err);
        setError(err.message);
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleClose = () => {
    setForm({ drugName: "", strength: "", usage: "", quantity: "" });
    setError(null);
    setIsSubmitting(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>เพิ่มรายการยา</DialogTitle>
          <p className="text-sm text-gray-400">กรอกข้อมูลยาที่ต้องการสั่งให้ผู้ป่วย</p>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <Label htmlFor="drugName">ชื่อยา</Label>
            <Input
              id="drugName"
              name="drugName"
              placeholder="เช่น Paracetamol"
              value={form.drugName}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="strength">ขนาด/ความแรง</Label>
            <Input
              id="strength"
              name="strength"
              placeholder="เช่น 500 mg"
              value={form.strength}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="usage">วิธีการใช้</Label>
            <Input
              id="usage"
              name="usage"
              placeholder="เช่น วันละ 3 ครั้ง หลังอาหาร"
              value={form.usage}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="quantity">จำนวนที่จ่าย</Label>
            <Input
              id="quantity"
              name="quantity"
              placeholder="เช่น 30 เม็ด"
              value={form.quantity}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        {error && <p className="text-sm text-red-500">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>ยกเลิก</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'กำลังเพิ่ม...' : 'เพิ่มยา'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
