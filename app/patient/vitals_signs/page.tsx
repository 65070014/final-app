"use client"

import type React from "react"
import { useState, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Activity, Heart, Wind, Thermometer, Weight, Ruler } from "lucide-react"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"
import { validateVitalSigns } from '@/utils/formValidation'
import { VitalSign } from '@/lib/types'


export default function VitalsSignsForm({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [form_errors, setFormErrors] = useState<{ [key: string]: string }>({});
  const { id } = use(params); 


  const initialFormData: VitalSign = {
    sbp: 0, dbp: 0, pr: 0, rr: 0, temperature: 0, weight: 0, height: 0,patientId: session?.user?.id ?? "",timestamp: new Date()
  };

   const [formData, setFormData] = useState<VitalSign>(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    const formErrors = validateVitalSigns(formData);

    if (Object.keys(formErrors).length > 0) {
      setFormErrors(formErrors);
      return;
    }

    setFormErrors({});
    setError("")

    if (!session?.user?.id) {
      setError("ไม่พบข้อมูลผู้ใช้ โปรดล็อกอินใหม่");
      return;
    }

    const vitalsSignsData = {
      ...formData,
      appointmentId: id,
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
        throw new Error(errorData.error || 'ไม่สามารถบันทึกนัดหมายได้');
      }

      alert("บันทึกนัดหมายสำเร็จ!");
      router.push("/patient/appointments");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Appointment submission failed:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 md:py-12">
      <Card className="shadow-lg">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl md:text-3xl text-balance">บันทึกข้อมูลสุขภาพ</CardTitle>
          </div>
          <CardDescription className="text-base leading-relaxed">กรุณาวัดและบันทึกข้อมูล ณ ปัจจุบัน เพื่อส่งให้แพทย์</CardDescription>
        </CardHeader>

        <CardContent>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Blood Pressure Section */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Heart className="h-4 w-4" />
                <span>ความดันโลหิต</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sbp" className="text-base">
                  SBP (ความดันโลหิตตัวบน)
                </Label>
                <div className="relative">
                  <Input
                    id="sbp"
                    type="number"
                    inputMode="numeric"
                    placeholder="กรอกค่า SBP"
                    value={formData.sbp}
                    onChange={(e) => handleChange("sbp", e.target.value)}
                    className="h-14 text-lg pr-20"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">mmHg</span>
                </div>
                {form_errors.sbp && (<p className="mt-1 text-sm text-red-500">{form_errors.sbp}</p>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dbp" className="text-base">
                  DBP (ความดันโลหิตตัวล่าง)
                </Label>
                <div className="relative">
                  <Input
                    id="dbp"
                    type="number"
                    inputMode="numeric"
                    placeholder="กรอกค่า DBP"
                    value={formData.dbp}
                    onChange={(e) => handleChange("dbp", e.target.value)}
                    className="h-14 text-lg pr-20"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">mmHg</span>
                </div>
              </div>
              {form_errors.dbp && (<p className="mt-1 text-sm text-red-500">{form_errors.dbp}</p>)}
            </div>

            {/* Vital Signs Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pr" className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  PR (อัตราการเต้นของหัวใจ)
                </Label>
                <div className="relative">
                  <Input
                    id="pr"
                    type="number"
                    inputMode="numeric"
                    placeholder="กรอกค่า PR"
                    value={formData.pr}
                    onChange={(e) => handleChange("pr", e.target.value)}
                    className="h-14 text-lg pr-28"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">ครั้ง/นาที</span>
                </div>
                {form_errors.pr && (<p className="mt-1 text-sm text-red-500">{form_errors.pr}</p>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rr" className="text-base flex items-center gap-2">
                  <Wind className="h-4 w-4 text-muted-foreground" />
                  RR (อัตราการหายใจ)
                </Label>
                <div className="relative">
                  <Input
                    id="rr"
                    type="number"
                    inputMode="numeric"
                    placeholder="กรอกค่า RR"
                    value={formData.rr}
                    onChange={(e) => handleChange("rr", e.target.value)}
                    className="h-14 text-lg pr-28"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">ครั้ง/นาที</span>
                </div>
                {form_errors.rr && (<p className="mt-1 text-sm text-red-500">{form_errors.rr}</p>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature" className="text-base flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                  อุณหภูมิร่างกาย
                </Label>
                <div className="relative">
                  <Input
                    id="temperature"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder="เช่น 36.5"
                    value={formData.temperature}
                    onChange={(e) => handleChange("temperature", e.target.value)}
                    className="h-14 text-lg pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">°C</span>
                </div>
              </div>
              {form_errors.temperature && (<p className="mt-1 text-sm text-red-500">{form_errors.temperature}</p>)}
            </div>

            {/* Body Measurements Section */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Weight className="h-4 w-4" />
                <span>ข้อมูลร่างกาย</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight" className="text-base">
                  น้ำหนักตัว
                </Label>
                <div className="relative">
                  <Input
                    id="weight"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder="กรอกน้ำหนัก"
                    value={formData.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                    className="h-14 text-lg pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">kg</span>
                </div>
                {form_errors.weight && (<p className="mt-1 text-sm text-red-500">{form_errors.weight}</p>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="height" className="text-base flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  ส่วนสูง
                </Label>
                <div className="relative">
                  <Input
                    id="height"
                    type="number"
                    inputMode="numeric"
                    placeholder="กรอกส่วนสูง"
                    value={formData.height}
                    onChange={(e) => handleChange("height", e.target.value)}
                    className="h-14 text-lg pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">cm</span>
                </div>
                {form_errors.height && (<p className="mt-1 text-sm text-red-500">{form_errors.height}</p>)}
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full h-14 text-lg font-medium">
              ส่งข้อมูลให้แพทย์
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
