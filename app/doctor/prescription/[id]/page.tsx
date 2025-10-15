"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export default function PrescriptionPage({ params }: { params: { id: string } }) {
  const [prescription, setPrescription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const res = await fetch(`/api/prescription/${params.id}`)
        const data = await res.json()
        setPrescription(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchPrescription()
  }, [params.id])

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <p className="text-center mt-10">กำลังโหลดข้อมูล...</p>

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-md mt-10 print:shadow-none print:bg-white">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h1 className="text-2xl font-bold">ใบจ่ายยา</h1>
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer size={18} /> พิมพ์
        </Button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">โรงพยาบาลเท็ดดี้แบร์</h2>
        <p>ที่อยู่: 123 ถนนสุขภาพดี แขวงใจดี เขตบางกอก</p>
        <hr className="my-4 border-gray-400" />
      </div>

      <div className="space-y-4 text-lg leading-relaxed">
        <p>ชื่อผู้ป่วย: <span className="font-semibold">{prescription.patient_name}</span></p>
        <p>วันที่: {prescription.date}</p>

        <table className="w-full border border-gray-400 mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">ชื่อยา</th>
              <th className="border px-3 py-2 text-left">วิธีใช้</th>
              <th className="border px-3 py-2 text-center">จำนวน</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medicines.map((med: any, index: number) => (
              <tr key={index}>
                <td className="border px-3 py-2">{med.name}</td>
                <td className="border px-3 py-2">{med.usage}</td>
                <td className="border px-3 py-2 text-center">{med.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-10 text-right">
          <p>ลงชื่อ.....................................................</p>
          <p>({prescription.doctor_name})</p>
        </div>
      </div>
    </div>
  )
}
