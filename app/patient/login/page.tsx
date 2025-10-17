import { PatientLoginForm } from "@/components/patient/patient_login_form"

export default function DoctorLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
    <div className="w-full max-w-md p-8 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-blue-600 dark:text-blue-400">
            เข้าสู่ระบบ
        </h1>
        
        <PatientLoginForm />
        
    </div>
</div>
  )
}
