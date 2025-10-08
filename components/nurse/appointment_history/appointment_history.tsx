"use client"
import { useEffect, useState } from "react"
import { Edit, Trash2, CheckCircle } from "lucide-react"
import { Appointment } from "@/lib/types"

export default function NurseDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/appointments")
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ")
        const data = await res.json()
        setAppointments(data)
      } catch (err) {
        console.error("Error fetching appointments:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAppointments()
  }, [])

  const confirmAppointment = async (id: number) => {
    setAppointments(prev =>
      prev.map(appt =>
        appt.id === id ? { ...appt, status: "ยืนยันแล้ว" } : appt
      )
    )
  }

  const deleteAppointment = async (id: number) => {
    setAppointments(prev => prev.filter(appt => appt.id !== id))
  }

  if (isLoading) return <div className="p-4">กำลังโหลดข้อมูล...</div>

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">การนัดหมายทั้งหมด</h2>
        <div className="space-y-4">
          {appointments.map(appt => (
            <div key={appt.id} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium p-1">{appt.patient}</p>
                <p className="text-sm p-1">{appt.date} | {appt.time} | {appt.department}</p>
                <p className="font-medium p-1">แพทย์: {appt.doctorname} </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs ${appt.patient_status === "Confirmed" ? "bg-green-200 text-green-700" : "bg-yellow-200 text-yellow-700"}`}>
                  {appt.patient_status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs ${appt.status === "Confirmed" ? "bg-green-200 text-green-700" : "bg-yellow-200 text-yellow-700"}`}>
                  {appt.status}
                </span>
                {appt.status === "Confirmed" && (
                  <button onClick={() => confirmAppointment(appt.id)} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                <button className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => deleteAppointment(appt.id)} className="p-2 bg-red-600 text-white rounded hover:bg-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
