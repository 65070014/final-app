"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Activity, Weight, Droplet, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { VitalRecord } from "@/app/patient/vitals_track/page"

type VitalSignsChartsProps = {
  records: VitalRecord[]
}

export function VitalSignsCharts({ records }: VitalSignsChartsProps) {
  const sortedRecords = [...records].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateA.getTime() - dateB.getTime()
  })

  const last7Days = sortedRecords.slice(-7)

  const bloodPressureData = last7Days
    .filter((r) => r.systolic && r.diastolic)
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" }),
      systolic: r.systolic,
      diastolic: r.diastolic,
    }))

  const weightData = last7Days
    .filter((r) => r.weight)
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" }),
      weight: r.weight,
    }))

  const bloodSugarData = last7Days
    .filter((r) => r.bloodSugar)
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" }),
      bloodSugar: r.bloodSugar,
    }))

  const getBloodPressureStatus = () => {
    const latest = sortedRecords[0]
    if (!latest?.systolic || !latest?.diastolic) return null

    if (latest.systolic < 120 && latest.diastolic < 80) {
      return { status: "ปกติ", variant: "success" as const, icon: Minus }
    } else if (latest.systolic >= 140 || latest.diastolic >= 90) {
      return { status: "สูงกว่าปกติ", variant: "destructive" as const, icon: TrendingUp }
    } else {
      return { status: "ค่อนข้างสูง", variant: "warning" as const, icon: TrendingUp }
    }
  }

  const getWeightTrend = () => {
    if (weightData.length < 2) return null
      const latest = weightData[weightData.length - 1].weight ?? 0 
      const previous = weightData[weightData.length - 2].weight ?? 0 
      
      const diff = latest - previous

    if (Math.abs(diff) < 0.5) {
      return { trend: "คงที่", icon: Minus, color: "text-muted-foreground" }
    } else if (diff > 0) {
      return { trend: `+${diff.toFixed(1)} กก.`, icon: TrendingUp, color: "text-warning" }
    } else {
      return { trend: `${diff.toFixed(1)} กก.`, icon: TrendingDown, color: "text-success" }
    }
  }

  const bloodPressureStatus = getBloodPressureStatus()
  const weightTrend = getWeightTrend()

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {bloodPressureStatus && (
          <Alert
            className={cn(
              bloodPressureStatus.variant === "success" && "border-success bg-success/10 text-success-foreground",
              bloodPressureStatus.variant === "warning" && "border-warning bg-warning/10 text-warning-foreground",
              bloodPressureStatus.variant === "destructive" &&
                "border-destructive bg-destructive/10 text-destructive-foreground",
            )}
          >
            <Activity className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">ความดันโลหิต</div>
              <div className="text-sm">{bloodPressureStatus.status}</div>
            </AlertDescription>
          </Alert>
        )}

        {weightTrend && (
          <Alert>
            <Weight className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">น้ำหนัก</div>
              <div className={cn("text-sm flex items-center gap-1", weightTrend.color)}>
                <weightTrend.icon className="h-3 w-3" />
                {weightTrend.trend}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {sortedRecords[0]?.bloodSugar && (
          <Alert>
            <Droplet className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">ระดับน้ำตาล</div>
              <div className="text-sm">{sortedRecords[0].bloodSugar} mg/dL</div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs defaultValue="blood-pressure" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="blood-pressure">ความดัน</TabsTrigger>
          <TabsTrigger value="weight">น้ำหนัก</TabsTrigger>
          <TabsTrigger value="blood-sugar">น้ำตาล</TabsTrigger>
        </TabsList>

        <TabsContent value="blood-pressure">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">ความดันโลหิต (7 วันย้อนหลัง)</h3>
            {bloodPressureData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bloodPressureData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    name="ตัวบน"
                    dot={{ fill: "hsl(var(--chart-1))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    name="ตัวล่าง"
                    dot={{ fill: "hsl(var(--chart-2))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                ยังไม่มีข้อมูลความดันโลหิต
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="weight">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">น้ำหนัก (7 วันย้อนหลัง)</h3>
            {weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" domain={["dataMin - 1", "dataMax + 1"]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    name="น้ำหนัก (กก.)"
                    dot={{ fill: "hsl(var(--chart-3))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">ยังไม่มีข้อมูลน้ำหนัก</div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="blood-sugar">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">ระดับน้ำตาล (7 วันย้อนหลัง)</h3>
            {bloodSugarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bloodSugarData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="bloodSugar"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    name="น้ำตาล (mg/dL)"
                    dot={{ fill: "hsl(var(--chart-4))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">ยังไม่มีข้อมูลระดับน้ำตาล</div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
