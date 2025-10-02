"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react"
import type { Symptom } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface SymptomLogProps {
  symptoms: Symptom[]
}

export function SymptomLog({ symptoms }: SymptomLogProps) {
  const sortedSymptoms = [...symptoms].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertCircle className="h-5 w-5 text-destructive" />
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-warning" />
      case "low":
        return <CheckCircle className="h-5 w-5 text-success" />
      default:
        return null
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ประวัติอาการล่าสุด (48 ชั่วโมง)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedSymptoms.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">ไม่มีข้อมูลอาการที่บันทึก</p>
          ) : (
            sortedSymptoms.map((symptom) => (
              <div
                key={symptom.id}
                className={cn(
                  "flex gap-3 rounded-lg border p-4 transition-colors",
                  symptom.severity === "high"
                    ? "border-destructive/50 bg-destructive/5"
                    : symptom.severity === "medium"
                      ? "border-warning/50 bg-warning/5"
                      : "border-border bg-card",
                )}
              >
                <div className="flex-shrink-0 pt-0.5">{getSeverityIcon(symptom.severity)}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        symptom.severity === "high"
                          ? "font-medium text-destructive"
                          : symptom.severity === "medium"
                            ? "text-warning"
                            : "text-foreground",
                      )}
                    >
                      {symptom.description}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(symptom.timestamp, {
                      addSuffix: true,
                      locale: th,
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
