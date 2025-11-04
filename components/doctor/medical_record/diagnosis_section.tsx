"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react"

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
  const updateField = (
    fieldOrObject: keyof DiagnosisNote | Partial<DiagnosisNote>,
    value?: string
  ) => {
    setDiagnosisNote(prev => {
      if (typeof fieldOrObject === 'string') {
        return {
          ...prev,
          [fieldOrObject]: value ?? '', // ใช้ค่าที่ส่งมา
        };
      } else {
        return {
          ...prev,
          ...fieldOrObject
        };
      }
    });
  };
  const icd10List = [
    { code: "J00", name: "หวัดธรรมดา (Common cold)" },
    { code: "J06.9", name: "การติดเชื้อทางเดินหายใจส่วนบนเฉียบพลัน" },
    { code: "R51", name: "อาการปวดศีรษะ (Headache)" },
    { code: "R05", name: "อาการไอ (Cough)" },
    { code: "R07.4", name: "อาการเจ็บคอ (Chest pain, unspecified)" },
    { code: "A09", name: "ท้องร่วง (Infectious gastroenteritis and colitis)" },
    { code: "K21.9", name: "กรดไหลย้อน (Gastro-oesophageal reflux disease without oesophagitis)" },
    { code: "I10", name: "ความดันโลหิตสูง (Essential (primary) hypertension)" },
    { code: "L30.9", name: "ผื่นผิวหนังอักเสบ, ไม่ระบุ (Dermatitis, unspecified)" },
  ];
  const selectedDiagnosis = icd10List.find(
    (item) => item.code === diagnosisNote.diagCode
  );
  const [open, setOpen] = useState(false);

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
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="diagName" className="text-base font-semibold">
              ชื่อโรคที่วินิจฉัย (ค้นหา ICD-10)
            </Label>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between text-base"
                >
                  {selectedDiagnosis
                    ? `${selectedDiagnosis.code} - ${selectedDiagnosis.name}`
                    : "พิมพ์หรือค้นหารหัส/ชื่อโรค..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-full p-0 z-50" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                <Command>
                  <CommandInput placeholder="ค้นหารหัสโรค หรือ ชื่อโรค..." />
                  <CommandList>
                    <CommandEmpty>ไม่พบโรคที่ค้นหา</CommandEmpty>
                    {icd10List.map((item) => (
                      <CommandItem
                        key={item.code}
                        value={`${item.code} ${item.name}`}
                        onSelect={() => {
                          const selectedItem = item;

                          if (selectedItem) {
                            updateField({
                              diagCode: String(selectedItem.code),
                              diagName: String(selectedItem.name),
                            });
                            console.log(selectedItem.code)
                            console.log(selectedItem.name)
                            console.log(diagnosisNote)
                          }
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${diagnosisNote.diagCode === item.code
                            ? "opacity-100"
                            : "opacity-0"
                            }`}
                        />
                        {`${item.code} - ${item.name}`}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {diagnosisNote.diagCode && (
              <p className="text-sm text-gray-500 mt-1">
                รหัส ICD-10 ที่บันทึก: <span className="font-semibold text-gray-700">{diagnosisNote.diagCode}</span>
              </p>
            )}
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
