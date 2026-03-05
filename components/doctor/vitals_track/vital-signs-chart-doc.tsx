/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import type { VitalRecord } from "@/lib/types"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { Heart, Activity, Thermometer, Weight } from "lucide-react"

interface VitalSignsChartProps {
  vitalSigns: VitalRecord[]
  targets: {
    systolicMax: number
    diastolicMax: number
    weightTarget: number
    tempMax?: number
    prMax?: number
  }
}

type TimeRange = "7d" | "30d" | "all"
type MetricType = "bp" | "pr" | "weight" | "temp" 

export function VitalSignsChart({ vitalSigns, targets }: VitalSignsChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")
  const [activeMetric, setActiveMetric] = useState<MetricType>("bp")

  const processedVitals = useMemo(() => {
    return vitalSigns.map(vs => {
      const cleanTime = vs.time.replace(' น.', '').trim();
      const dateTimeString = `${vs.date} ${cleanTime}`;

      const parsedWeight = vs.weight ? parseFloat(vs.weight as unknown as string) : undefined;
      const parsedTemp = vs.temp ? parseFloat(vs.temp as unknown as string) : undefined;
      const parsedPr = vs.pr ? parseFloat(vs.pr as unknown as string) : undefined; // ดึงค่า PR

      return {
        timestamp: new Date(dateTimeString),
        systolic: vs.systolic,
        diastolic: vs.diastolic,
        pr: parsedPr, // ค่า PR
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

  // แยก Data ให้แต่ละกราฟ
  const bloodPressureData = useMemo(() => filteredData.filter(vs => vs.systolic !== undefined && vs.diastolic !== undefined).map(vs => ({ date: format(vs.timestamp, "dd/MM", { locale: th }), systolic: vs.systolic, diastolic: vs.diastolic, timestamp: vs.timestamp.getTime() })), [filteredData]);
  const pulseData = useMemo(() => filteredData.filter(vs => vs.pr !== undefined).map(vs => ({ date: format(vs.timestamp, "dd/MM", { locale: th }), pr: vs.pr, timestamp: vs.timestamp.getTime() })), [filteredData]);
  const weightData = useMemo(() => filteredData.filter(vs => vs.weight !== undefined).map(vs => ({ date: format(vs.timestamp, "dd/MM", { locale: th }), weight: vs.weight, timestamp: vs.timestamp.getTime() })), [filteredData]);
  const temperatureData = useMemo(() => filteredData.filter(vs => vs.temp !== undefined).map(vs => ({ date: format(vs.timestamp, "dd/MM", { locale: th }), temperature: vs.temp, timestamp: vs.timestamp.getTime() })), [filteredData]);

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border-2 border-gray-200 bg-white p-3 shadow-xl">
          <p className="text-sm font-black text-gray-500 mb-2 border-b pb-1">
            {format(new Date(payload[0].payload.timestamp), "dd MMM yyyy เวลา HH:mm น.", { locale: th })}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-[1.1rem] font-black" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // --- UI Components สำหรับกรณีไม่มีข้อมูล ---
  const EmptyDataState = ({ title }: { title: string }) => (
    <div className="h-[350px] flex flex-col justify-center items-center text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
      <Activity className="h-10 w-10 mb-2 opacity-50" />
      <p>⚠️ ไม่มีข้อมูล {title} ในช่วงเวลานี้</p>
    </div>
  );

  return (
    <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
      
      {/* 🌟 ส่วน Header ควบคุมทั้งหมด (เลือกกราฟ + เลือกเวลา) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 border-b bg-slate-50">
        
        {/* แท็บเลือกประเภทกราฟ */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={activeMetric === "bp" ? "default" : "outline"} 
            className={`font-black rounded-xl ${activeMetric === "bp" ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
            onClick={() => setActiveMetric("bp")}
          >
            <Heart className="w-4 h-4 mr-2" /> ความดันโลหิต
          </Button>
          <Button 
            variant={activeMetric === "pr" ? "default" : "outline"} 
            className={`font-black rounded-xl ${activeMetric === "pr" ? "bg-rose-500 hover:bg-rose-600 text-white" : ""}`}
            onClick={() => setActiveMetric("pr")}
          >
            <Activity className="w-4 h-4 mr-2" /> ชีพจร
          </Button>
          <Button 
            variant={activeMetric === "temp" ? "default" : "outline"} 
            className={`font-black rounded-xl ${activeMetric === "temp" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`}
            onClick={() => setActiveMetric("temp")}
          >
            <Thermometer className="w-4 h-4 mr-2" /> อุณหภูมิ
          </Button>
          <Button 
            variant={activeMetric === "weight" ? "default" : "outline"} 
            className={`font-black rounded-xl ${activeMetric === "weight" ? "bg-slate-700 hover:bg-slate-800 text-white" : ""}`}
            onClick={() => setActiveMetric("weight")}
          >
            <Weight className="w-4 h-4 mr-2" /> น้ำหนัก
          </Button>
        </div>

        {/* ปุ่มเลือกช่วงเวลา */}
        <div className="flex bg-gray-200 p-1 rounded-xl">
          <Button variant={timeRange === "7d" ? "default" : "ghost"} size="sm" className={`rounded-lg font-bold ${timeRange === "7d" ? "bg-white text-black shadow-sm" : "text-gray-500"}`} onClick={() => setTimeRange("7d")}>
            7 วัน
          </Button>
          <Button variant={timeRange === "30d" ? "default" : "ghost"} size="sm" className={`rounded-lg font-bold ${timeRange === "30d" ? "bg-white text-black shadow-sm" : "text-gray-500"}`} onClick={() => setTimeRange("30d")}>
            30 วัน
          </Button>
          <Button variant={timeRange === "all" ? "default" : "ghost"} size="sm" className={`rounded-lg font-bold ${timeRange === "all" ? "bg-white text-black shadow-sm" : "text-gray-500"}`} onClick={() => setTimeRange("all")}>
            ทั้งหมด
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        
        {/* 🔴 เรนเดอร์กราฟ ความดันโลหิต */}
        {activeMetric === "bp" && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-black mb-4">แนวโน้มความดันโลหิต (mmHg)</h3>
            {bloodPressureData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={bloodPressureData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} domain={[60, 180]} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={targets.systolicMax} stroke="#DC2626" strokeDasharray="3 3" label={{ value: "เป้าหมาย Systolic", position: "insideTopLeft", fill: "#DC2626", fontSize: 12, fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="systolic" name="ตัวบน (Systolic)" stroke="#DC2626" strokeWidth={3} dot={{ fill: "#DC2626", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="diastolic" name="ตัวล่าง (Diastolic)" stroke="#2563EB" strokeWidth={3} dot={{ fill: "#2563EB", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyDataState title="ความดันโลหิต" />}
          </div>
        )}

        {/* 🌹 เรนเดอร์กราฟ ชีพจร (Pulse) */}
        {activeMetric === "pr" && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-black mb-4">แนวโน้มอัตราการเต้นของหัวใจ (bpm)</h3>
            {pulseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={pulseData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} domain={[40, 140]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="pr" name="ชีพจร" stroke="#F43F5E" strokeWidth={3} dot={{ fill: "#F43F5E", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyDataState title="ชีพจร" />}
          </div>
        )}

        {/* 🟠 เรนเดอร์กราฟ อุณหภูมิ */}
        {activeMetric === "temp" && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-black mb-4">แนวโน้มอุณหภูมิร่างกาย (°C)</h3>
            {temperatureData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={temperatureData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip content={<CustomTooltip />} />
                  {targets.tempMax && <ReferenceLine y={targets.tempMax} stroke="#F97316" strokeDasharray="3 3" label={{ value: "มีไข้สูง", position: "insideTopLeft", fill: "#F97316", fontSize: 12, fontWeight: 'bold' }} />}
                  <Line type="monotone" dataKey="temperature" name="อุณหภูมิ" stroke="#F97316" strokeWidth={3} dot={{ fill: "#F97316", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyDataState title="อุณหภูมิร่างกาย" />}
          </div>
        )}

        {/* 🔘 เรนเดอร์กราฟ น้ำหนัก */}
        {activeMetric === "weight" && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-black mb-4">แนวโน้มน้ำหนักตัว (kg)</h3>
            {weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={weightData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={targets.weightTarget} stroke="#10B981" strokeDasharray="3 3" label={{ value: "เป้าหมาย", position: "insideTopLeft", fill: "#10B981", fontSize: 12, fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="weight" name="น้ำหนัก" stroke="#475569" strokeWidth={3} dot={{ fill: "#475569", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyDataState title="น้ำหนักตัว" />}
          </div>
        )}

      </CardContent>
    </Card>
  )
}