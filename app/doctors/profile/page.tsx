import DoctorProfile from "@/components/doctor/profile/profile"

export default function DoctorPage() {
  return (
    <div className="min-h-screen bg-[#bfd9ff] p-8 text-black">
      <div className="max-w-4xl mx-auto bg-white  rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center ">ข้อมูลส่วนตัวแพทย์</h1>
        <DoctorProfile />
      </div>
    </div>
  )
}
