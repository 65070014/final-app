"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Activity } from "lucide-react"

interface Monitoring {
  isActive: boolean
  endDate: string
}

interface MonitoringSectionProps {
  monitoring: Monitoring
  setMonitoring: (monitoring: Monitoring) => void
}

export function MonitoringSection({ monitoring, setMonitoring }: MonitoringSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          การติดตามผล
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="monitoring-active" className="text-base font-semibold">
              เปิดใช้งานการติดตามผล
            </Label>
            <p className="text-sm text-muted-foreground">ระบบจะส่งแบบฟอร์มติดตามอาการให้ผู้ป่วยกรอกเป็นประจำ</p>
          </div>
          <Switch
            id="monitoring-active"
            checked={monitoring.isActive}
            onCheckedChange={(checked) => setMonitoring({ ...monitoring, isActive: checked })}
          />
        </div>

        {monitoring.isActive && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Label htmlFor="monitoring-end-date" className="text-base font-semibold">
              วันสิ้นสุดการติดตามผล
            </Label>
            <Input
              id="monitoring-end-date"
              type="date"
              value={monitoring.endDate}
              onChange={(e) => setMonitoring({ ...monitoring, endDate: e.target.value })}
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground">ระบบจะหยุดส่งแบบฟอร์มติดตามอาการหลังจากวันที่กำหนด</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
