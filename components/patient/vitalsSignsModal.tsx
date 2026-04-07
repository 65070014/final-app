"use client"

import React, { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@radix-ui/react-label"
import { Activity, Heart, Wind, Thermometer, Weight, Stethoscope, StickyNote } from "lucide-react"
import { validateVitalSigns } from '@/utils/formValidation'
import { VitalSign } from '@/lib/types'
import { Textarea } from "../ui/textarea"

interface VitalsSignsModalProps {
  appointmentId: string;
  onSuccess?: () => void;
  isOpen?: boolean;
  onClose?: (open: boolean) => void;
  buttonClassName?: string
}

export function VitalsSignsModal({ appointmentId, onSuccess, isOpen, onClose, buttonClassName }: VitalsSignsModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const router = useRouter()
  const { data: session } = useSession();

  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormData: VitalSign = {
    sbp: 0, dbp: 0, pr: 0, rr: 0, temperature: 0, weight: 0, height: 0,
    patientId: session?.user?.id ?? "",
    timestamp: new Date()
  };
  const [formData, setFormData] = useState<VitalSign>(initialFormData);

  const isControlled = isOpen !== undefined;
  const showModal = isControlled ? isOpen : internalOpen;
  const setShowModal = isControlled ? onClose : setInternalOpen;


  const handleChange = (field: string, value: string) => {
    const finalValue = field === "note"
      ? value
      : (value === "" ? 0 : parseFloat(value));

    setFormData((prev) => ({ ...prev, [field]: finalValue }));

    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const errors = validateVitalSigns(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    setFormErrors({});
    setError("")

    if (!session?.user?.id) {
      setError("ไม่พบข้อมูลผู้ใช้ โปรดล็อกอินใหม่");
      setIsSubmitting(false);
      return;
    }

    const vitalsSignsData = {
      ...formData,
      appointmentId: appointmentId,
      patientId: session.user.id
    }

    try {
      const response = await fetch('/api/vitals_signs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vitalsSignsData),
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ไม่สามารถบันทึกข้อมูลได้');
      }
      if (setShowModal) setShowModal(false);

      setFormData(initialFormData);
      if (onSuccess) onSuccess();
      router.refresh();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Submission failed:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className={`${buttonClassName || 'text-white gap-[0.5rem] shadow-sm text-[1.1rem] rounded-[0.75rem] bg-emerald-600 hover:bg-emerald-700 py-[1.2rem] px-[1.5rem]'}`} size='lg'>
            <Stethoscope size={22} />
            <span className="font-bold">บันทึกสัญญาณชีพ</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[60rem] max-h-[98vh] overflow-y-auto rounded-[1rem] border-none shadow-2xl p-0">
        <DialogHeader className="p-[1.25rem] border-b bg-white">
          <DialogTitle className="text-[1.5rem] font-black flex items-center gap-[0.5rem] text-blue-800">
            <Activity className="h-[1.75rem] w-[1.75rem] text-blue-600" />
            บันทึกสัญญาณชีพ (Vital Signs)
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-[0.9rem]">
            บันทึกข้อมูลสุขภาพปัจจุบันของผู้ป่วย
          </DialogDescription>
        </DialogHeader>

        <div className="p-[1.25rem] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-100 text-black p-[0.75rem] rounded-[0.75rem] text-[1rem] font-bold mb-[1rem]">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-[1rem]">
            <div className="grid grid-cols-3 gap-[1rem]">
              <div className="p-[1rem] bg-orange-50/30 rounded-[1rem] border border-orange-100">
                <Label htmlFor="sbp" className="flex items-center gap-[0.5rem]">
                  <Heart className="h-[1rem] w-[1rem]" /> Systolic (ความดันตัวบน)</Label>
                <div className="relative">
                  <Input
                    id="sbp" type="number"
                    value={formData.sbp || ''}
                    placeholder="120"
                    onChange={(e) => handleChange("sbp", e.target.value)}
                    className="text-[1.25rem] h-[3.5rem] font-bold rounded-[0.75rem] border-blue-200 focus:ring-blue-500 pr-[3.5rem]"
                  />
                  <span className="absolute right-[0.75rem] top-1/2 -translate-y-1/2 text-[0.85rem] font-bold text-black">mmHg</span>
                </div>
                {formErrors.sbp && <p className="text-[0.85rem] font-black text-red-600 mt-1">⚠️ {formErrors.sbp}</p>}
              </div>
              <div className="p-[1rem] bg-sky-50/30 rounded-[1rem] border border-sky-100">
                <Label htmlFor="dbp" className="flex items-center gap-[0.5rem]">
                  <Heart className="h-[1rem] w-[1rem]" />  Diastolic (ความดันตัวล่าง)</Label>
                <div className="relative">
                  <Input
                    id="dbp" type="number"
                    value={formData.dbp || ''}
                    placeholder="80"
                    onChange={(e) => handleChange("dbp", e.target.value)}
                    className="text-[1.25rem] h-[3.5rem] font-bold rounded-[0.75rem] border-blue-200 focus:ring-blue-500 pr-[3.5rem]"
                  />
                  <span className="absolute right-[0.75rem] top-1/2 -translate-y-1/2 text-[0.85rem] font-bold text-black">mmHg</span>
                </div>
                {formErrors.dbp && <p className="text-[0.85rem] font-black text-red-600 mt-1">⚠️ {formErrors.dbp}</p>}
              </div>
                <div className="p-[1rem] bg-rose-50/30 rounded-[1rem] border border-rose-100">
                  <Label htmlFor="pr" className="flex items-center gap-[0.5rem]">
                    <Activity className="h-[1rem] w-[1rem]" /> ชีพจร (Pulse)
                  </Label>
                  <div className="relative">
                    <Input
                      id="pr" type="number"
                      placeholder="80"
                      value={formData.pr || ''}
                      onChange={(e) => handleChange("pr", e.target.value)}
                      className="text-[1.25rem] h-[3.5rem] font-bold rounded-[0.75rem] border-rose-200"
                    />
                    <span className="absolute right-[0.75rem] top-1/2 -translate-y-1/2 text-[0.85rem] font-bold text-black">bpm</span>
                  </div>
                  {formErrors.pr && <p className="text-[0.85rem] font-black text-red-600 mt-1">⚠️ {formErrors.pr}</p>}
                </div>

                <div className="p-[1rem] bg-sky-50/30 rounded-[1rem] border border-sky-100">
                  <Label htmlFor="rr" className="flex items-center gap-[0.5rem]">
                    <Wind className="h-[1rem] w-[1rem]" /> การหายใจ (RR)
                  </Label>
                  <div className="relative">
                    <Input
                      id="rr" type="number"
                      placeholder="20"
                      value={formData.rr || ''}
                      onChange={(e) => handleChange("rr", e.target.value)}
                      className="text-[1.25rem] h-[3.5rem] font-bold rounded-[0.75rem] border-sky-200"
                    />
                    <span className="absolute right-[0.75rem] top-1/2 -translate-y-1/2 text-[0.85rem] font-bold text-black">/min</span>
                  </div>
                  {formErrors.rr && <p className="text-[0.85rem] font-black text-red-600 mt-1">⚠️ {formErrors.rr}</p>}
                </div>

                <div className="p-[1rem] bg-orange-50/30 rounded-[1rem] border border-orange-100">
                  <Label htmlFor="temperature" className="flex items-center gap-[0.5rem]">
                    <Thermometer className="h-[1rem] w-[1rem]" /> อุณหภูมิ
                  </Label>
                  <div className="relative">
                    <Input
                      id="temperature" type="number" step="0.1"
                      value={formData.temperature || ''}
                      placeholder="35"
                      onChange={(e) => handleChange("temperature", e.target.value)}
                      className="text-[1.25rem] h-[3.5rem] font-bold rounded-[0.75rem] border-orange-200"
                    />
                    <span className="absolute right-[0.75rem] top-1/2 -translate-y-1/2 text-[0.85rem] font-bold text-black">°C</span>
                  </div>
                  {formErrors.temperature && <p className="text-[0.85rem] font-black text-red-600 mt-1">⚠️ {formErrors.temperature}</p>}
                </div>

                <div className="p-[1rem] bg-gray-50 rounded-[1rem] border border-gray-200">
                  <Label htmlFor="weight" className="flex items-center gap-[0.5rem]">
                    <Weight className="h-[1rem] w-[1rem]" /> น้ำหนักตัว
                  </Label>
                  <div className="relative">
                    <Input
                      id="weight" type="number" step="0.1"
                      value={formData.weight || ''}
                      placeholder="0.0"
                      onChange={(e) => handleChange("weight", e.target.value)}
                      className="text-[1.25rem] h-[3.5rem] font-bold rounded-[0.75rem] border-gray-300"
                    />
                    <span className="absolute right-[0.75rem] top-1/2 -translate-y-1/2 text-[0.85rem] font-bold text-black">kg</span>
                  </div>
                  {formErrors.weight && <p className="text-[0.85rem] font-black text-red-600 mt-1">⚠️ {formErrors.temperature}</p>}
                </div>
            </div>
            <div className="p-[1rem] bg-gray-50 rounded-[1rem] border border-gray-200">
              <Label htmlFor="note" className="flex items-center gap-[0.5rem]">
                <StickyNote className="h-[1rem] w-[1rem]" /> หมายเหตุเพิ่มเติม
              </Label>
              <Textarea
                id="note"
                placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)..."
                value={formData.note || ''}
                onChange={(e) => handleChange("note", e.target.value)}
                className="text-[1.25rem] h-[3.5rem] font-bold rounded-[0.75rem] border-gray-300"
              />
            </div>

            <DialogFooter className="pt-[1rem] border-t flex gap-[0.75rem]">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowModal && setShowModal(false)}
                className="text-[1.1rem] h-[3.5rem] px-[1.5rem] font-bold text-gray-500"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-[1.1rem] h-[3.5rem] rounded-[0.75rem] font-black flex-1 shadow-lg"
              >
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}