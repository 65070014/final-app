"use client"
import { useState } from "react"
import { Calendar, ClipboardList, PlusCircle, Edit, Trash2, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function NurseDashboard() {
  const [appointments, setAppointments] = useState([
    { id: 1, patient: "สมชาย ใจดี", date: "6 ต.ค. 2568", time: "09:00 น.", department: "อายุรกรรม", status: "รอการยืนยัน" },
    { id: 2, patient: "สายฝน นามดี", date: "7 ต.ค. 2568", time: "13:00 น.", department: "หัวใจ", status: "ยืนยันแล้ว" },
  ])

  const confirmAppointment = (id: number) => {
    setAppointments(prev =>
      prev.map(appt =>
        appt.id === id ? { ...appt, status: "ยืนยันแล้ว" } : appt
      )
    )
  }

  const deleteAppointment = (id: number) => {
    setAppointments(prev => prev.filter(appt => appt.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="bg-blue-900 text-white rounded-lg p-6 mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Nurse Dashboard</h1>
          <span className="text-sm">ยินดีต้อนรับ, พยาบาล</span>
        </div>
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Link href="/nurse/appointments">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md flex flex-col items-center hover:bg-gray-100 cursor-pointer">
            <PlusCircle className="w-8 h-8 text-blue-600 mb-2" />
            <p className="font-medium">เพิ่มการนัดหมาย</p>
          </div>
          </Link>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md flex flex-col items-center hover:bg-gray-100 cursor-pointer">
            <ClipboardList className="w-8 h-8 text-green-600 mb-2" />
            <p className="font-medium">ดูประวัติการนัดหมาย</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md flex flex-col items-center hover:bg-gray-100 cursor-pointer">
            <Calendar className="w-8 h-8 text-purple-600 mb-2" />
            <p className="font-medium">จัดการการนัดหมาย</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">การนัดหมายล่าสุด</h2>
          <div className="space-y-4">
            {appointments.map(appt => (
              <div key={appt.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{appt.patient}</p>
                  <p className="text-sm text-gray-600">{appt.date} | {appt.time} | {appt.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${appt.status === "ยืนยันแล้ว" ? "bg-green-200 text-green-700" : "bg-yellow-200 text-yellow-700"}`}>
                    {appt.status}
                  </span>
                  {appt.status === "รอการยืนยัน" && (
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
    </div>
  )
}
