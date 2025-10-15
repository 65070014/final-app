"use client"

import { use, useEffect, useState } from "react"
import { VitalSignsForm } from "@/components/patient/vitals_track/vital-signs-form"
import { VitalSignsCharts } from "@/components/patient/vitals_track/vital-signs-charts"
import { VitalSignsTable } from "@/components/patient/vitals_track/vital-signs-table"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity } from "lucide-react"
import { VitalRecord } from "@/lib/types"
import { useSession } from "next-auth/react"

export default function VitalSignsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const [records, setRecords] = useState<VitalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecord() {
      if (status !== 'authenticated' || !session?.user?.id) {
        if (status !== 'loading') {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      const patient_id = session.user.id
      try {
        const response = await fetch(`/api/patients/vitals_track?patientId=${patient_id}&appointmentId=${id}`);

        if (!response.ok) {
          throw new Error('ไม่สามารถดึงรายการนัดหมายได้');
        }

        const data = await response.json();
        setRecords(data);
        console.log(data)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Error fetching appointments:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    if (status === 'authenticated') {
      fetchRecord();
    }

  }, [id, session, status]);

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
        <VitalSignsForm id={id} />

        <Card className="p-6">
          <Tabs defaultValue="charts" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="charts">กราฟแนวโน้ม</TabsTrigger>
              <TabsTrigger value="table">ตารางข้อมูล</TabsTrigger>
            </TabsList>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {isLoading ?(
                <p className="text-center text-gray-500 py-10">กำลังโหลดรายการนัดหมาย...</p>
            ) : (
            <>
            <TabsContent value="charts" className="space-y-6">
              <VitalSignsCharts records={records} />
            </TabsContent>

            <TabsContent value="table">
              <VitalSignsTable records={records} />
            </TabsContent>
            </>
          )}
          </Tabs>
        </Card>
      </main>
    </div>
  )
}
