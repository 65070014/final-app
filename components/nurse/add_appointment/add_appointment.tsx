"use client"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export default function NurseAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    department: "",
    date: "",
    time: "",
    symptom: ""
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          fetch("/api/patients"),
          fetch("/api/doctors")
        ])

        const patientsData = await patientsRes.json()
        const doctorsData = await doctorsRes.json()

        setPatients(patientsData)
        setDoctors(doctorsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    setAppointments(prev => [
      ...prev,
      {
        id: prev.length + 1,
        ...formData
      }
    ])
    setFormData({ patient: "", doctor: "", department: "", date: "", time: "", symptom: "" })
  }

  if (isLoading) {
    return <div>กำลังโหลดข้อมูล...</div>
  }

  if (!patients.length) {
    return <div>ไม่พบข้อมูลผู้ป่วย</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">เพิ่มการนัดหมาย</h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">นัดหมายที่มีอยู่</h2>
          <div className="space-y-4">
            {appointments.map(appt => (
              <div key={appt.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                <p className="font-medium">{appt.date} เวลา {appt.time}</p>
                <p className="text-sm">ผู้ป่วย: {appt.patient}</p>
                <p className="text-sm">แพทย์: {appt.doctor} ({appt.department})</p>
                <p className="text-sm ">อาการ: {appt.symptom}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">สร้างนัดหมายใหม่</h2>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm mb-1">เลือกผู้ป่วย</label>
              <select
                name="patient"
                value={formData.patient}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">-- เลือกผู้ป่วย --</option>
                {patients.map((p) => (
                  <option key={p.patient_id}>
                    {p.gender === "1" ? "นาย" : "นาง/น.ส."} {p.fname} {p.lname}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm pr-2">ดูตารางเวลานัดหมายของผู้ป่วย</label>
              <Button type="button" className="p-2">คลิกเพื่อเปิด</Button>
            </div>
            <div>
              <label className="text-sm ">เลือกแพทย์</label>
              <select
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">-- เลือกแพทย์ --</option>
                {doctors.map((d) => (
                  <option key={d.medical_personnel_id} value={d.medical_personnel_id}>
                    {d.position === 1
                      ? (d.gender === 1 ? "นพ." : "พญ.") : (d.gender === 1 ? "นาย" : "นาง/น.ส.")
                    } {d.fname} {d.lname}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm pr-2">ดูตารางเวลานัดหมายของแพทย์</label>
              <Button type="button" className="p-2">คลิกเพื่อเปิด</Button>
            </div>

            <div>
              <label className="block text-sm mb-1">แผนก</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full p-2 border rounded" placeholder="เช่น อายุรกรรม" />
            </div>

            <div>
              <label className="block text-sm mb-1">วันที่</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm mb-1">เวลา</label>
              <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm mb-1">อาการ</label>
              <textarea name="symptom" value={formData.symptom} onChange={handleChange} className="w-full p-2 border rounded" rows={3} placeholder="อาการเบื้องต้น"></textarea>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">บันทึกการนัดหมาย</button>
          </form>
        </div>
      </div>
    </div>
  )
}
