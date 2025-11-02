/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import type { VitalRecord } from "@/lib/types"
import { format } from "date-fns"
import { th } from "date-fns/locale"

interface VitalSignsChartProps {
  vitalSigns: VitalRecord[]
  targets: {
    systolicMax: number
    diastolicMax: number
    weightTarget: number
    tempMax?: number
  }
}

type TimeRange = "7d" | "30d" | "all"


export function VitalSignsChart({ vitalSigns, targets }: VitalSignsChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")

  const processedVitals = useMemo(() => {
    return vitalSigns.map(vs => {
      const cleanTime = vs.time.replace(' น.', '').trim();
      const dateTimeString = `${vs.date} ${cleanTime}`;

      const parsedWeight = vs.weight ? parseFloat(vs.weight as unknown as string) : undefined;
      const parsedTemp = vs.temp ? parseFloat(vs.temp as unknown as string) : undefined;

      return {
        timestamp: new Date(dateTimeString),
        systolic: vs.systolic,
        diastolic: vs.diastolic,
        weight: parsedWeight,
        temp: parsedTemp,
      };
    });
  }, [vitalSigns]);

  const filteredData = useMemo(() => {

    const now = Date.now();
    const ranges = {
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      all: Number.POSITIVE_INFINITY,
    };

    return processedVitals
      .filter((vs) => now - vs.timestamp.getTime() <= ranges[timeRange])
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  }, [processedVitals, timeRange]);

  const bloodPressureData = useMemo(() => {
    return filteredData
      .filter(vs =>
        vs.systolic !== undefined && vs.systolic !== null &&
        vs.diastolic !== undefined && vs.diastolic !== null
      )
      .map((vs) => ({
        date: format(vs.timestamp, "dd/MM", { locale: th }),
        systolic: vs.systolic as number,
        diastolic: vs.diastolic as number,
        timestamp: vs.timestamp.getTime(),
      }));
  }, [filteredData]);

  const weightData = useMemo(() => filteredData
    .filter(vs => vs.weight !== undefined && vs.weight !== null)
    .map((vs) => ({
      date: format(vs.timestamp, "dd/MM", { locale: th }),
      weight: vs.weight as number,
      timestamp: vs.timestamp.getTime(),
    })), [filteredData]);

  const temperatureData = useMemo(() => filteredData
    .filter((vs) => vs.temp !== undefined && vs.temp !== null)
    .map((vs) => ({
      date: format(vs.timestamp, "dd/MM", { locale: th }),
      temperature: vs.temp as number,
      timestamp: vs.timestamp.getTime(),
    })), [filteredData]);

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
      {/* Blood Pressure Chart */}
      <Card>
        <div className="flex gap-2 p-6">
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
        <CardHeader>
          <CardTitle className="text-base">ความดันโลหิต (mmHg)</CardTitle>
        </CardHeader>
        <CardContent>
          {bloodPressureData && bloodPressureData.length > 0 ? (
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
          ) : (
            <div
              style={{
                height: 300,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'hsl(var(--muted-foreground))',
                fontSize: '1rem',
                border: '1px dashed hsl(var(--border))',
                borderRadius: 'var(--radius)',
                padding: '20px'
              }}
            >
              ⚠️ ไม่มีข้อมูลความดันโลหิตในช่วงเวลานี้
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weight Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">น้ำหนัก (kg)</CardTitle>
        </CardHeader>
        <CardContent>
          {weightData && weightData.length > 0 ? (
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
          ) : (
            <div
              style={{
                height: 300,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'hsl(var(--muted-foreground))',
                fontSize: '1rem',
                border: '1px dashed hsl(var(--border))',
                borderRadius: 'var(--radius)',
                padding: '20px'
              }}
            >
              ⚠️ ไม่มีข้อมูลน้ำหนักในช่วงเวลานี้
            </div>
          )}
        </CardContent>
      </Card>

      {/* Temp Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">อุณหภูมิร่างกาย (°C)</CardTitle>
        </CardHeader>
        <CardContent>
          {temperatureData && temperatureData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  domain={[
                    Math.floor(Math.min(...temperatureData.map((d) => d.temperature)) - 5),
                    Math.ceil(Math.max(...temperatureData.map((d) => d.temperature)) + 5),
                  ]}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={targets.tempMax}
                  stroke="hsl(var(--success))"
                  strokeDasharray="3 3"
                  label={{ value: "เป้าหมาย", position: "right", fill: "hsl(var(--success))" }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="อุณหภูมิร่างกาย"
                  stroke="hsl(var(--chart-4))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-4))", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: 300,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'hsl(var(--muted-foreground))',
                fontSize: '1rem',
                border: '1px dashed hsl(var(--border))',
                borderRadius: 'var(--radius)',
                padding: '20px'
              }}
            >
              ⚠️ ไม่มีข้อมูลอุณหภูมิร่างกายในช่วงเวลานี้
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
