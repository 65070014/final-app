import AppointmentList from "@/components/nurse/dashboard"

export default function NurseDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">จัดการการนัดหมาย</h1>
        <p className="text-center text-gray-500 mb-8">
          พยาบาลสามารถตรวจสอบนัดหมายจากผู้ป่วย และกดยืนยันเพื่อส่งต่อให้แพทย์
        </p>
        <AppointmentList />
      </div>
    </div>
  )
}
