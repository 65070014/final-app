import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, User, Calendar, Activity } from "lucide-react"

export function PatientReferencePanel() {
  const patient = {
    name: "นางสาวสมหญิง ใจดี",
    age: 35,
    gender: "หญิง",
    allergies: ["Penicillin", "Aspirin"],
    chronicDiseases: ["เบาหวาน", "ความดันโลหิตสูง"],
    symptoms: "ปวดศีรษะมาก 3 วัน มีไข้เล็กน้อย คลื่นไส้ อาเจียน รู้สึกเหนื่อยล้า",
  }

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          ข้อมูลผู้ป่วย
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">{patient.name}</h3>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>อายุ: {patient.age} ปี</span>
            <span>เพศ: {patient.gender}</span>
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
              <Input id="pr" type="number" placeholder="80" className="h-9" readOnly />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rr" className="text-xs">
                RR (ครั้ง/นาที)
              </Label>
              <Input id="rr" type="number" placeholder="18" className="h-9" readOnly />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sbp" className="text-xs">
                SBP (mmHg)
              </Label>
              <Input id="sbp" type="number" placeholder="120" className="h-9" readOnly />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dbp" className="text-xs">
                DBP (mmHg)
              </Label>
              <Input id="dbp" type="number" placeholder="80" className="h-9" readOnly />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weight" className="text-xs">
                น้ำหนัก (kg)
              </Label>
              <Input id="weight" type="number" step="0.1" placeholder="65.5" className="h-9" readOnly />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="height" className="text-xs">
                ส่วนสูง (cm)
              </Label>
              <Input id="height" type="number" step="0.1" placeholder="165" className="h-9" readOnly />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="temp" className="text-xs">
                อุณหภูมิ (°C)
              </Label>
              <Input id="temp" type="number" step="0.1" placeholder="37.0" className="h-9" readOnly />
            </div>
          </div>
        </div>

        {/* Critical Info - Allergies */}
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-destructive mb-2">การแพ้ยา</h4>
              {patient.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy) => (
                    <Badge key={allergy} variant="destructive" className="bg-destructive text-destructive-foreground">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">ไม่มีข้อมูล</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg">
          <div className="flex items-start gap-2">
            <Activity className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-accent-foreground mb-2">โรคประจำตัว</h4>
              {patient.chronicDiseases.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.chronicDiseases.map((disease) => (
                    <Badge key={disease} variant="secondary" className="bg-accent/20 text-accent-foreground">
                      {disease}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">ไม่มีข้อมูล</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            อาการที่ผู้ป่วยแจ้ง
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed p-3 bg-muted rounded-lg">{patient.symptoms}</p>
        </div>
      </CardContent>
    </Card>
  )
}
