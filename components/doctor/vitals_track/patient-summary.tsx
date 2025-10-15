"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Patient } from "@/lib/types"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { AlertTriangle, Calendar, User } from "lucide-react"

interface PatientSummaryProps {
  patient: Patient
}

export function PatientSummary({ patient }: PatientSummaryProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Patient Info */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-2xl font-bold text-foreground">{patient.name}</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                อายุ {patient.age} ปี • รหัสผู้ป่วย: {patient.id}
              </p>
            </div>
          </div>

          <div className="flex gap-6">

            <div className="w-1/2 space-y-2">
              <p className="text-sm font-medium text-foreground">โรคประจำตัว</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {patient.chronicConditions}
                </Badge>
              </div>
            </div>

            <div className="w-1/2 space-y-2">
              <p className="text-sm font-medium text-foreground">โรควินิจฉัย</p>
              <div className="flex flex-wrap gap-2">
                {patient.diag_name ? (
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                    {patient.diag_name}
                  </Badge>
                ) : (
                  <Badge variant="outline">ไม่พบข้อมูล</Badge>
                )}
              </div>
            </div>

          </div>

          {patient.allergies.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <p className="text-sm font-medium text-destructive">ประวัติการแพ้ยา</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="bg-destructive/10 text-destructive border-destructive/50"
                >
                  {patient.allergies}
                </Badge>
              </div>
            </div>
          )}

          <div className="space-y-2 rounded-lg border border-border bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">ระยะเวลาติดตามผล</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">วันที่เริ่มต้น</p>
                <p className="font-medium text-foreground">
                  {format(patient.monitoringStartDate, "dd MMM yyyy", { locale: th })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">วันที่สิ้นสุด</p>
                <p className="font-medium text-foreground">
                  {format(patient.monitoringEndDate, "dd MMM yyyy", { locale: th })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
