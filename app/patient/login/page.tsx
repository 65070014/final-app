import { PatientLoginForm } from "@/components/patient/patient_login_form"

export default function DoctorLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">เข้าสู่ระบบ</h1>
        <PatientLoginForm />
      </div>
    </div>
  )
}
