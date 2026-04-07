/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { VitalSignsChart } from "@/components/doctor/vitals_track/vital-signs-chart-doc"
import { SymptomLog } from "@/components/doctor/vitals_track/symptom-log"
import { Activity, Heart, Thermometer, Weight, MessageSquare, Stethoscope, Loader2, AlertCircle, RefreshCcw } from "lucide-react"
import { VitalRecord } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { PatientNav } from "@/components/patient/patient_nav"
import { VitalsSignsModal } from '@/components/patient/vitalsSignsModal';

export default function PatientHealthDashboard() {
  const [vitalSigns, setVitalSigns] = useState<VitalRecord[]>([])
  const [doctorAdvice, setDoctorAdvice] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session, status } = useSession()
  
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const targets = { systolicMax: 140, diastolicMax: 90, weightTarget: 75, tempMax: 37.5 }
  const patientId = session?.user?.id

  useEffect(() => {
    if (!patientId) return;

    async function fetchMyVitals() {
      setIsLoading(true)
      setError(null) 
      try {
        const [vitalsResponse, adviceResponse] = await Promise.all([
          fetch(`/api/patients/vitals_track?patientId=${patientId}`),
          fetch(`/api/patients/doctor_advice?patientId=${patientId}`)
        ]);

        if (!vitalsResponse.ok) throw new Error("ไม่สามารถดึงข้อมูลสุขภาพได้");

        const vitalsData = await vitalsResponse.json();
        const adviceData = adviceResponse.ok ? await adviceResponse.json() : null;

        setVitalSigns(vitalsData);
        setDoctorAdvice(adviceData);
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMyVitals()
  }, [patientId, refreshTrigger])

  const latest = vitalSigns[0] || null

  return (
    <div className="flex h-screen bg-slate-200 font-sans">
      <PatientNav />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* --- Header --- */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-black p-2 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-[1.5rem] font-black text-black">ติดตามสุขภาพของฉัน</h1>
                <p className=" font-bold text-[1.1rem] italic">ติดตามแนวโน้มและบันทึกสัญญาณชีพรายวัน</p>
              </div>
            </div>
            
            <div>
              <VitalsSignsModal
                appointmentId={""}
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
              />
            </div>
          </div>

          {status === "loading" || isLoading ? (
            <div className="h-[50vh] flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-[1.2rem] font-black text-gray-600">กำลังดึงข้อมูลสุขภาพของคุณ...</p>
            </div>
          ) : error ? (
              <div className="h-[50vh] flex flex-col items-center justify-center">
                <div className="bg-red-50 p-8 rounded-2xl flex flex-col items-center border-2 border-red-200 max-w-md text-center shadow-sm">
                  <AlertCircle className="h-14 w-14 text-red-500 mb-4" />
                  <p className="text-[1.5rem] font-black text-red-700 mb-2">เกิดข้อผิดพลาด</p>
                  <p className="text-[1.1rem] font-bold text-red-600 mb-6">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-black transition-colors"
                  >
                    <RefreshCcw size={18} /> ลองใหม่อีกครั้ง
                  </button>
                </div>
              </div>
            ) : (
                <div className="space-y-6 animate-in fade-in duration-500">
                  
                  {/* --- Quick Stats --- */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 ">
                    <StatCard
                      title="ความดันโลหิต"
                      value={latest ? `${latest.systolic}/${latest.diastolic}` : "--/--"}
                      unit="mmHg"
                      icon={<Heart className="text-red-500" />}
                      status={latest?.systolic > targets.systolicMax ? "warning" : "normal"}
                      className="text-[1.25rem] font-black text-black"
                    />
                    <StatCard title="ชีพจร" value={latest?.pr || "--"} unit="bpm" icon={<Activity className="text-rose-500" />} className="text-[1.25rem] font-black text-black" />
                    <StatCard title="อุณหภูมิ" value={latest?.temp || "--"} unit="°C" icon={<Thermometer className="text-orange-500" />} className="text-[1.25rem] font-black text-black" />
                    <StatCard title="น้ำหนัก" value={latest?.weight || "--"} unit="kg" icon={<Weight className="text-slate-500" />} className="text-[1.25rem] font-black text-black" />
                  </div>

                  {/* --- Main Content (แบ่งซ้าย 2 ส่วน / ขวา 1 ส่วน) --- */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* ด้านซ้าย (โชว์กราฟ) */}
                    <div className="xl:col-span-2 space-y-6">
                      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-white border-b pb-4">
                          <CardTitle className="text-lg font-black text-black flex items-center gap-2">
                            <Activity size={20} className="text-blue-600" />
                            กราฟแสดงแนวโน้มสุขภาพ
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 bg-white">
                          {vitalSigns.length > 0 ? (
                            <VitalSignsChart vitalSigns={vitalSigns} targets={targets} />
                          ) : (
                            <div className="h-[300px] flex flex-col gap-2 items-center justify-center text-gray-400">
                              <Activity className="h-12 w-12 opacity-20" />
                              <span className="font-bold italic">ยังไม่มีข้อมูลสำหรับแสดงกราฟ</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* 🌟 ด้านขวา (Sidebar) รวมคำแนะนำหมอ กับ ประวัติอาการ */}
                    <div className="xl:col-span-1 space-y-6">
                      
                      {/* ย้ายกล่องคำแนะนำแพทย์มาไว้ตรงนี้ */}
                      {doctorAdvice && doctorAdvice.length > 0 && (
                        <div className="bg-white border-2 border-blue-600 rounded-2xl overflow-hidden shadow-md">
                          <div className="bg-blue-600 px-6 py-3 flex items-center gap-2">
                            <Stethoscope className="text-white h-5 w-5" />
                            <h2 className="text-white font-black text-lg">คำแนะนำจากแพทย์ (ล่าสุด)</h2>
                          </div>
                          <div className="flex flex-col">
                            {doctorAdvice.slice(0, 3).map((advice: any, index: number) => (
                              <div
                                key={index}
                                className={`p-6 flex items-start gap-4 ${index !== (doctorAdvice.slice(0, 3).length - 1) ? 'border-b border-gray-100' : ''}`}
                              >
                                <div className="bg-blue-50 p-3 rounded-full shrink-0 mt-1">
                                  <MessageSquare className="text-blue-600 h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[1.1rem] font-black text-black leading-relaxed italic">
                                    {advice.doctor_advice}
                                  </p>
                                  <p className="text-xs font-bold text-gray-400 mt-2">
                                    อัปเดตเมื่อ: {new Date(advice.advice_date).toLocaleDateString('th-TH')}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <SymptomLog vitalSigns={vitalSigns} />
                    </div>

                  </div>
                </div>
              )}
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, unit, icon, status = "normal" }: any) {
  return (
    <Card className={`border-none shadow-sm rounded-2xl transition-all ${status === 'warning' ? 'bg-red-50 border-2 border-red-200' : 'bg-white border border-gray-100'}`}>
      <CardContent className="p-5 flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-[1.75rem] font-black ${status === 'warning' ? 'text-red-600' : 'text-black'}`}>{value}</span>
            <span className="text-xs font-bold text-gray-400">{unit}</span>
          </div>
        </div>
        <div className="bg-slate-50 p-2 rounded-xl">{icon}</div>
      </CardContent>
    </Card>
  )
}