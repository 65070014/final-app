"use client"

import React, { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Activity, Heart, Wind, Thermometer, Weight, Ruler, Stethoscope, Save, Loader2 } from "lucide-react"
import { validateVitalSigns } from '@/utils/formValidation'
import { VitalSign } from '@/lib/types'

interface VitalsSignsModalProps {
  appointmentId: string;
  onSuccess?: () => void;
  isOpen?: boolean; 
  onClose?: (open: boolean) => void;
}

export function VitalsSignsModal({ appointmentId, onSuccess, isOpen, onClose }: VitalsSignsModalProps) {
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

  // ✅ LOGIC เลือกโหมด: ถ้ามี isOpen ส่งมา ให้ใช้ค่าจากข้างนอก ถ้าไม่มี ให้ใช้ internalOpen
  const isControlled = isOpen !== undefined;
  const showModal = isControlled ? isOpen : internalOpen;
  const setShowModal = isControlled ? onClose : setInternalOpen;


  const handleChange = (field: string, value: string) => {
    const numValue = value === "" ? 0 : parseFloat(value);
    setFormData((prev) => ({ ...prev, [field]: numValue }));

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
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm">
            <Stethoscope size={18} />
            บันทึกสัญญาณชีพ
            </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-blue-700">
            <Activity className="h-6 w-6" />
            บันทึกสัญญาณชีพ (Vital Signs)
          </DialogTitle>
          <DialogDescription>
            กรุณากรอกข้อมูลร่างกายปัจจุบันของผู้ป่วยเพื่อประกอบการวินิจฉัย
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">

          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-2">
              <Heart className="h-4 w-4" />
              ความดันโลหิต (Blood Pressure)
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sbp" className="text-xs text-muted-foreground uppercase">Systolic (ตัวบน)</Label>
                <div className="relative">
                  <Input
                    id="sbp" type="number" placeholder="120"
                    value={formData.sbp || ''}
                    onChange={(e) => handleChange("sbp", e.target.value)}
                    className={formErrors.sbp ? "border-red-500 pr-12" : "pr-12"}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400">mmHg</span>
                </div>
                {formErrors.sbp && <p className="text-xs text-red-500">{formErrors.sbp}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dbp" className="text-xs text-muted-foreground uppercase">Diastolic (ตัวล่าง)</Label>
                <div className="relative">
                  <Input
                    id="dbp" type="number" placeholder="80"
                    value={formData.dbp || ''}
                    onChange={(e) => handleChange("dbp", e.target.value)}
                    className={formErrors.dbp ? "border-red-500 pr-12" : "pr-12"}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400">mmHg</span>
                </div>
                {formErrors.dbp && <p className="text-xs text-red-500">{formErrors.dbp}</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pr" className="flex items-center gap-1.5 text-sm">
                <Activity className="h-3.5 w-3.5 text-rose-500" /> ชีพจร
              </Label>
              <div className="relative">
                <Input
                  id="pr" type="number" placeholder="80"
                  value={formData.pr || ''}
                  onChange={(e) => handleChange("pr", e.target.value)}
                  className="pr-16"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-400">bpm</span>
              </div>
              {formErrors.pr && <p className="text-xs text-red-500">{formErrors.pr}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rr" className="flex items-center gap-1.5 text-sm">
                <Wind className="h-3.5 w-3.5 text-sky-500" /> การหายใจ
              </Label>
              <div className="relative">
                <Input
                  id="rr" type="number" placeholder="20"
                  value={formData.rr || ''}
                  onChange={(e) => handleChange("rr", e.target.value)}
                  className="pr-16"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-400">/min</span>
              </div>
              {formErrors.rr && <p className="text-xs text-red-500">{formErrors.rr}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature" className="flex items-center gap-1.5 text-sm">
                <Thermometer className="h-3.5 w-3.5 text-orange-500" /> อุณหภูมิ
              </Label>
              <div className="relative">
                <Input
                  id="temperature" type="number" step="0.1" placeholder="36.5"
                  value={formData.temperature || ''}
                  onChange={(e) => handleChange("temperature", e.target.value)}
                  className="pr-10"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-400">°C</span>
              </div>
              {formErrors.temperature && <p className="text-xs text-red-500">{formErrors.temperature}</p>}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-1.5">
                <Weight className="h-4 w-4 text-gray-500" /> น้ำหนัก
              </Label>
              <div className="relative">
                <Input
                  id="weight" type="number" step="0.1" placeholder="0.0"
                  value={formData.weight || ''}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  className="pr-10 bg-white"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-400">kg</span>
              </div>
              {formErrors.weight && <p className="text-xs text-red-500">{formErrors.weight}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="height" className="flex items-center gap-1.5">
                <Ruler className="h-4 w-4 text-gray-500" /> ส่วนสูง
              </Label>
              <div className="relative">
                <Input
                  id="height" type="number" placeholder="0"
                  value={formData.height || ''}
                  onChange={(e) => handleChange("height", e.target.value)}
                  className="pr-10 bg-white"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-400">cm</span>
              </div>
              {formErrors.height && <p className="text-xs text-red-500">{formErrors.height}</p>}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowModal && setShowModal(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> บันทึก...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> บันทึกข้อมูล
                </>
              )}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  )
}