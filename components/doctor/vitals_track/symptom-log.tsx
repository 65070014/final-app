"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { VitalRecord } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface SymptomLogProps {
  vitalSigns: VitalRecord[]
}

export function SymptomLog({ vitalSigns }: SymptomLogProps) {
  const processedVitalsWithTimestamp = vitalSigns.map(vs => {
    const cleanTime = vs.time.replace(' น.', '').trim();
    const dateTimeString = `${vs.date} ${cleanTime}`;

    return {
      ...vs,
      timestamp: new Date(dateTimeString),
    };
  });

  const filteredSymptoms = processedVitalsWithTimestamp.filter(symptom =>
    symptom.notes
  );

  // เรียงลำดับจากใหม่ไปเก่า (ล่าสุดขึ้นก่อน)
  const sortedSymptoms = [...filteredSymptoms].sort((a, b) =>
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ประวัติอาการล่าสุด</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {sortedSymptoms.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">ไม่มีข้อมูลอาการที่บันทึก</p>
          ) : (
            sortedSymptoms.map((symptom) => (
              <div
                key={`${symptom.id}-${symptom.date}-${symptom.time}`}
                className={cn(
                  "flex gap-3 rounded-lg border p-4 transition-colors",
                )}
              >
                <div className="flex-shrink-0 pt-0.5">
                </div>
                <div className="flex-1 space-y-1">

                  <div className="text-sm font-medium text-foreground">
                    {symptom.notes}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {symptom.date} {symptom.time.replace(' น.', '').trim()} ({
                      formatDistanceToNow(symptom.timestamp, {
                        addSuffix: true,
                        locale: th,
                      })
                    })
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
