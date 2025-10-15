"use client"

import { use, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export default function MedicalCertificatePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/diagnosis/${id}`)
        const result = await res.json()
        setData(result)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <p className="text-center mt-10">กำลังโหลดข้อมูล...</p>

  return (
    <div className="max-w-3xl mx-auto p-8 shadow-md mt-10 print:shadow-none print:bg-white">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h1 className="text-2xl font-bold">ใบรับรองแพทย์</h1>
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer size={18} /> พิมพ์
        </Button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">โรงพยาบาลเท็ดดี้แบร์</h2>
        <p>ที่อยู่: 123 ถนนสุขภาพดี แขวงใจดี เขตบางกอก</p>
        <hr className="my-4 border-gray-400" />
      </div>

      <div className="space-y-3 text-lg leading-relaxed">
        <p>ข้าพเจ้า <span className="font-semibold">{data.doctor_name}</span></p>
        <p>ได้ตรวจร่างกายของ <span className="font-semibold">{data.patient_name}</span></p>
        <p>เมื่อวันที่ {data.diagnosis_date}</p>
        <p>พบว่า {data.diagnosis}</p>
        <p>
          และเห็นสมควรให้หยุดพักรักษาตัวเป็นเวลา{" "}
          <span className="font-semibold">3</span> วัน
        </p>
        <p className="mt-8 text-right">ลงชื่อ...............................................</p>
        <p className="text-right">({data.doctor_name})</p>
      </div>
    </div>
  )
}


