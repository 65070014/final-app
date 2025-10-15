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

  const twoDaysAgo = Date.now() - (48 * 60 * 60 * 1000);

  const filteredSymptoms = processedVitalsWithTimestamp.filter(symptom =>
    (symptom.notes && symptom.timestamp.getTime() > twoDaysAgo)
  );

  const sortedSymptoms = [...filteredSymptoms].sort((a, b) =>
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ประวัติอาการล่าสุด (48 ชั่วโมง)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedSymptoms.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">ไม่มีข้อมูลอาการที่บันทึกในช่วง 48 ชั่วโมง</p>
          ) : (
            sortedSymptoms.map((symptom) => (
              <div
                key={symptom.id}
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
