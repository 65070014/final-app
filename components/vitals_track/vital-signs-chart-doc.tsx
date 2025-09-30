"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import type { VitalSign } from "@/lib/types"
import { format } from "date-fns"
import { th } from "date-fns/locale"

interface VitalSignsChartProps {
  vitalSigns: VitalSign[]
  targets: {
    systolicMax: number
    diastolicMax: number
    weightTarget: number
    bloodSugarMax?: number
  }
}

type TimeRange = "7d" | "30d" | "all"

export function VitalSignsChart({ vitalSigns, targets }: VitalSignsChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")

  const getFilteredData = () => {
    const now = Date.now()
    const ranges = {
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      all: Number.POSITIVE_INFINITY,
    }

    return vitalSigns
      .filter((vs) => now - vs.timestamp.getTime() <= ranges[timeRange])
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  const filteredData = getFilteredData()

  const bloodPressureData = filteredData.map((vs) => ({
    date: format(vs.timestamp, "dd/MM", { locale: th }),
    systolic: vs.systolic,
    diastolic: vs.diastolic,
    timestamp: vs.timestamp.getTime(),
  }))

  const weightData = filteredData.map((vs) => ({
    date: format(vs.timestamp, "dd/MM", { locale: th }),
    weight: vs.weight,
    timestamp: vs.timestamp.getTime(),
  }))

  const bloodSugarData = filteredData
    .filter((vs) => vs.bloodSugar !== undefined)
    .map((vs) => ({
      date: format(vs.timestamp, "dd/MM", { locale: th }),
      bloodSugar: vs.bloodSugar,
      timestamp: vs.timestamp.getTime(),
    }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">
            {format(new Date(payload[0].payload.timestamp), "dd MMM yyyy", { locale: th })}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        <Button variant={timeRange === "7d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("7d")}>
          7 วัน
        </Button>
        <Button variant={timeRange === "30d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("30d")}>
          30 วัน
        </Button>
        <Button variant={timeRange === "all" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("all")}>
          ทั้งหมด
        </Button>
      </div>

      {/* Blood Pressure Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ความดันโลหิต (mmHg)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bloodPressureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} domain={[60, 180]} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={targets.systolicMax}
                stroke="hsl(var(--destructive))"
                strokeDasharray="3 3"
                label={{ value: "เป้าหมาย Systolic", position: "right", fill: "hsl(var(--destructive))" }}
              />
              <ReferenceLine
                y={targets.diastolicMax}
                stroke="hsl(var(--warning))"
                strokeDasharray="3 3"
                label={{ value: "เป้าหมาย Diastolic", position: "right", fill: "hsl(var(--warning))" }}
              />
              <Line
                type="monotone"
                dataKey="systolic"
                name="Systolic"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-1))", r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                name="Diastolic"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-2))", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weight Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">น้ำหนัก (kg)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                domain={[
                  Math.floor(Math.min(...weightData.map((d) => d.weight)) - 5),
                  Math.ceil(Math.max(...weightData.map((d) => d.weight)) + 5),
                ]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={targets.weightTarget}
                stroke="hsl(var(--success))"
                strokeDasharray="3 3"
                label={{ value: "เป้าหมาย", position: "right", fill: "hsl(var(--success))" }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                name="น้ำหนัก"
                stroke="hsl(var(--chart-4))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-4))", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Blood Sugar Chart (if available) */}
      {bloodSugarData.length > 0 && targets.bloodSugarMax && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ระดับน้ำตาล (mg/dL)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bloodSugarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} domain={[80, 250]} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={targets.bloodSugarMax}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="3 3"
                  label={{ value: "เป้าหมาย", position: "right", fill: "hsl(var(--destructive))" }}
                />
                <Line
                  type="monotone"
                  dataKey="bloodSugar"
                  name="ระดับน้ำตาล"
                  stroke="hsl(var(--chart-5))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-5))", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
