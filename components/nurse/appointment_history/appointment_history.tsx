"use client"
import { useState } from "react"
import { Edit, Trash2, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function NurseDashboard() {
    const [appointments, setAppointments] = useState([
        { id: 1, patient: "สมชาย ใจดี", date: "6 ต.ค. 2568", time: "09:00 น.", department: "อายุรกรรม",doctor:"นพ. สมชาย ใจดี", status: "รอการยืนยัน",patientstatus:"คนไข้ยืนยันแล้ว" },
        { id: 2, patient: "สายฝน นามดี", date: "7 ต.ค. 2568", time: "13:00 น.", department: "หัวใจ",doctor:"พญ. สายใจ นามงาม", status: "ยืนยันแล้ว",patientstatus:"คนไข้ยืนยันแล้ว" },
        { id: 3, patient: "สายัญ สัญจร", date: "11 ต.ค. 2568", time: "15:00 น.", department: "ปอด",doctor:"นพ. วีระพล แก้วใส", status: "รอการยืนยัน",patientstatus:"รอการยืนยันจากคนไข้" },
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
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                < div className=" bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 " >
                    <h2 className="text-xl font-semibold mb-4">การนัดหมายทั้งหมด</h2>
                    <div className="space-y-4">
                        {appointments.map(appt => (
                            <div key={appt.id} className="p-4 border rounded-lg flex justify-between items-center">
                                <div >
                                    <p className="font-medium p-1">{appt.patient}</p>
                                    <p className="text-sm text-black-600 p-1">{appt.date} | {appt.time} | {appt.department}</p>
                                    <p className="font-medium p-1">แพทย์: {appt.doctor}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs ${appt.patientstatus === "คนไข้ยืนยันแล้ว" ? "bg-green-200 text-green-700" : "bg-yellow-200 text-yellow-700"}`}>
                                        {appt.patientstatus}
                                    </span>
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
                </div >
            </div>
        </div >
    )
}