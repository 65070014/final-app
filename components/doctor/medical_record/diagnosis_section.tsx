"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { FileText } from "lucide-react"

interface DiagnosisNote {
  diagName: string
  diagCode: string
  treatmentNote: string
}

interface DiagnosisSectionProps {
  diagnosisNote: DiagnosisNote
  setDiagnosisNote: (note: DiagnosisNote) => void
}

export function DiagnosisSection({ diagnosisNote, setDiagnosisNote }: DiagnosisSectionProps) {
  const updateField = (field: keyof DiagnosisNote, value: string) => {
    setDiagnosisNote({ ...diagnosisNote, [field]: value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          การวินิจฉัยและการรักษา
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="diagName" className="text-base font-semibold">
              ชื่อโรคที่วินิจฉัย
            </Label>
            <Input
              id="diagName"
              placeholder="เช่น ไข้หวัดใหญ่, ความดันโลหิตสูง, เบาหวาน..."
              value={diagnosisNote.diagName}
              onChange={(e) => updateField("diagName", e.target.value)}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagCode" className="text-base font-semibold">
              รหัสโรค (ICD-10)
            </Label>
            <Input
              id="diagCode"
              placeholder="เช่น J11.1, I10"
              value={diagnosisNote.diagCode}
              onChange={(e) => updateField("diagCode", e.target.value)}
              className="text-base"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="treatmentNote" className="text-base font-semibold">
            บันทึกการรักษาและคำแนะนำ
          </Label>
          <Textarea
            id="treatmentNote"
            placeholder="สรุปผลการตรวจ การวินิจฉัย แผนการรักษา และคำแนะนำสำหรับผู้ป่วย..."
            value={diagnosisNote.treatmentNote}
            onChange={(e) => updateField("treatmentNote", e.target.value)}
            className="min-h-[200px] resize-y"
          />
        </div>
      </CardContent>
    </Card>
  )
}
