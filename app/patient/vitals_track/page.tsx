"use client"

import { useState } from "react"
import { VitalSignsForm } from "@/components/patient/vitals_track/vital-signs-form"
import { VitalSignsCharts } from "@/components/patient/vitals_track/vital-signs-charts"
import { VitalSignsTable } from "@/components/patient/vitals_track/vital-signs-table"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity } from "lucide-react"

export type VitalRecord = {
  id: string
  date: string
  time: string
  systolic?: number
  diastolic?: number
  weight?: number
  bloodSugar?: number
  notes?: string
}

export default function VitalSignsPage() {
  const [records] = useState<VitalRecord[]>([
    {
      id: "1",
      date: "2025-09-23",
      time: "08:30",
      systolic: 120,
      diastolic: 80,
      weight: 70,
      bloodSugar: 95,
      notes: "รู้สึกสบายดี",
    },
    {
      id: "2",
      date: "2025-09-24",
      time: "08:45",
      systolic: 118,
      diastolic: 78,
      weight: 69.8,
      bloodSugar: 92,
      notes: "นอนหลับดี",
    },
    {
      id: "3",
      date: "2025-09-25",
      time: "09:00",
      systolic: 122,
      diastolic: 82,
      weight: 70.2,
      bloodSugar: 98,
      notes: "ออกกำลังกายเช้า",
    },
    {
      id: "4",
      date: "2025-09-26",
      time: "08:15",
      systolic: 119,
      diastolic: 79,
      weight: 69.5,
      bloodSugar: 90,
      notes: "รู้สึกดีมาก",
    },
    {
      id: "5",
      date: "2025-09-27",
      time: "08:30",
      systolic: 121,
      diastolic: 81,
      weight: 69.8,
      bloodSugar: 94,
      notes: "",
    },
    {
      id: "6",
      date: "2025-09-28",
      time: "09:15",
      systolic: 117,
      diastolic: 77,
      weight: 69.6,
      bloodSugar: 91,
      notes: "ทานอาหารเช้าดี",
    },
    {
      id: "7",
      date: "2025-09-29",
      time: "08:00",
      systolic: 120,
      diastolic: 80,
      weight: 69.9,
      bloodSugar: 93,
      notes: "สุขภาพดี",
    },
  ])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-balance">บันทึกสัญญาณชีพและอาการ</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <VitalSignsForm onSubmit={function (): void {
        } }/>

        <Card className="p-6">
          <Tabs defaultValue="charts" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="charts">กราฟแนวโน้ม</TabsTrigger>
              <TabsTrigger value="table">ตารางข้อมูล</TabsTrigger>
            </TabsList>

            <TabsContent value="charts" className="space-y-6">
              <VitalSignsCharts records={records} />
            </TabsContent>

            <TabsContent value="table">
              <VitalSignsTable records={records} />
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  )
}
