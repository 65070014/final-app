"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface DispenseModalProps {
  open: boolean
  onClose: () => void
  patientName?: string
}

export default function DispenseModal({ open, onClose, patientName }: DispenseModalProps) {
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

  const handleSubmit = () => {
    console.log("จ่ายยาให้:", patientName, form)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>เพิ่มรายการยา</DialogTitle>
          <p className="text-sm text-gray-400">กรอกข้อมูลยาที่ต้องการสั่งให้ผู้ป่วย</p>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>ชื่อยา</Label>
            <Input
              name="drugName"
              placeholder="เช่น Paracetamol"
              value={form.drugName}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>ขนาด/ความแรง</Label>
            <Input
              name="strength"
              placeholder="เช่น 500 mg"
              value={form.strength}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>วิธีการใช้</Label>
            <Input
              name="usage"
              placeholder="เช่น วันละ 3 ครั้ง หลังอาหาร"
              value={form.usage}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>จำนวนที่จ่าย</Label>
            <Input
              name="quantity"
              placeholder="เช่น 30 เม็ด"
              value={form.quantity}
              onChange={handleChange}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ยกเลิก</Button>
          <Button onClick={handleSubmit}>เพิ่มยา</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
