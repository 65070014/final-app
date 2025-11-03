"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, User, Calendar, Activity } from "lucide-react"
import { PatientVitalSummary } from "@/lib/types"
import { useEffect, useState } from "react"
import { ParamValue } from "next/dist/server/request/params"

export function PatientReferencePanel(appointmentId: { appointmentId: ParamValue }) {
  const idString = appointmentId.appointmentId;
  const [patient, setPatient] = useState<PatientVitalSummary>()
  const [isloadingpatient, setIsLoadingPatient] = useState(true)
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatientVitals() {
      setIsLoadingPatient(true);
      setError(null);
      try {
        const response = await fetch(`/api/appointments/onePatient/${idString}`);

        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลผู้ป่วยได้');
        }

        const data = await response.json();
        setPatient(data[0]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Error fetching appointments:", error);
        setError(error.message);
      } finally {
        setIsLoadingPatient(false);
      }
    }
    fetchPatientVitals();
  }, [idString]);

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          ข้อมูลผู้ป่วย
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isloadingpatient ? (
          <p className="text-center text-gray-500 py-10">กำลังโหลดรายการนัดหมาย...</p>
        ) : (
          <>
            <div>
              <h3 className="font-semibold text-lg mb-2">{patient?.patient}</h3>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>อายุ: {patient?.age} ปี</span>
              </div>
            </div>

            <div className="p-4 bg-muted/50 border rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                สัญญาณชีพ
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pr" className="text-xs">
                    PR (ครั้ง/นาที)
                  </Label>
                  <Input id="pr" type="number" placeholder={String(patient?.pr ?? 'N/A')} className="h-9" readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rr" className="text-xs">
                    RR (ครั้ง/นาที)
                  </Label>
                  <Input id="rr" type="number" placeholder={String(patient?.rr ?? 'N/A')} className="h-9" readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sbp" className="text-xs">
                    SBP (mmHg)
                  </Label>
                  <Input id="sbp" type="number" placeholder={String(patient?.sbp ?? 'N/A')} className="h-9" readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dbp" className="text-xs">
                    DBP (mmHg)
                  </Label>
                  <Input id="dbp" type="number" placeholder={String(patient?.dbp ?? 'N/A')} className="h-9" readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="weight" className="text-xs">
                    น้ำหนัก (kg)
                  </Label>
                  <Input id="weight" type="number" step="0.1" placeholder={String(patient?.weight ?? 'N/A')} className="h-9" readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="temp" className="text-xs">
                    อุณหภูมิ (°C)
                  </Label>
                  <Input id="temp" type="number" step="0.1" placeholder={String(patient?.temp ?? 'N/A')} className="h-9" readOnly />
                </div>
              </div>
            </div>

            {/* Critical Info - Allergies */}
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-destructive mb-2">การแพ้ยา</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="destructive" className="bg-destructive text-destructive-foreground">
                      {patient?.allergies}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Activity className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-accent-foreground mb-2">โรคประจำตัว</h4>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                          {patient?.underlying_diseases}
                        </Badge>
                    </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                อาการที่ผู้ป่วยแจ้ง
              </h4>
              <p className="text-base text-gray-800 leading-relaxed p-3 bg-muted rounded-lg">{patient?.symptoms}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
