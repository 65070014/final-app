"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function NurseAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("");
  const router = useRouter()
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    department: "",
    date: "",
    time: "",
    symptoms: "",
    status: "Confirmed",
    patient_status: "Pending"
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          fetch("/api/patients"),
          fetch("/api/doctors")
        ])
        if (!patientsRes.ok) {
          throw new Error('ไม่สามารถดึงรายชื่อคนไข้ได้');
        }
        if (!doctorsRes.ok) {
          throw new Error('ไม่สามารถดึงรายชื่อแพทย์ได้');
        }

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


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")


    if (!formData.date || !formData.time || !formData.symptoms || !formData.department) {
      setError("กรุณากรอกข้อมูล วันที่, เวลา, อาการ, ชื่อคนไข้, แพทย์, แผนก ให้ครบถ้วน");
      return;
    }

    setIsLoading(true)

    const appointmentData = {
      ...formData,
    }

    if (isLoading) {
      return <div>กำลังโหลดข้อมูล...</div>
    }

    if (!patients.length) {
      return <div>ไม่พบข้อมูลผู้ป่วย</div>
    }

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      })

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Appointment submission failed:', errorData);
        throw new Error(errorData.error || 'ไม่สามารถบันทึกนัดหมายได้');
        
      }

      alert("บันทึกนัดหมายสำเร็จ!");
      router.push("/nurse/appointment_history");

    } catch (err: any) {
      console.error("Appointment submission failed:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoading(false)
    }
  }

  {
    error && (
      <div className="text-red-500 mb-4">
        {error}
      </div>
    )
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
                value={formData.patientId}
                onChange={(e) =>
                  setFormData({ ...formData, patientId: e.target.value })
                }
                className="w-full p-2 border rounded"
              >
                <option value="">-- เลือกผู้ป่วย --</option>
                {patients.map((p) => (
                  <option key={p.patient_id} value={p.patient_id}>
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
                value={formData.doctorId}
                onChange={(e) =>
                  setFormData({ ...formData, doctorId: e.target.value })
                }
                className="w-full p-2 border rounded"
              >
                <option value="">-- เลือกแพทย์ --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id} >
                    {d.position === 1
                      ? (d.gender === 1 ? "นพ." : "พญ.") : (d.gender === 1 ? "นาย" : "นาง/น.ส.")
                    } {d.name}
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
              <input type="date" name="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full p-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm mb-1">เวลา</label>
              <input type="time" name="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full p-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm mb-1">อาการ</label>
              <textarea name="symptoms" value={formData.symptoms} onChange={handleChange} className="w-full p-2 border rounded" rows={3} placeholder="อาการเบื้องต้น"></textarea>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">บันทึกการนัดหมาย</button>
          </form>
        </div>
      </div>
    </div>
  )
}

