import Navbar from "@/components/doctor/homepage/navbar"
import Banner from "@/components/doctor/homepage/banner"
import PatientCard from "@/components/doctor/homepage/patient-card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6">
        <Banner />

        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black">ผู้ป่วยของเรา</h2>
            <input
              type="text"
              placeholder="ค้นหาผู้ป่วย"
              className="border rounded-full px-4 py-2 text-black bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PatientCard name="นายก้องบบ สรีทอง" specialty="" />
            <PatientCard name="นางรุ่งเรือง ยิ่งยืนยง" specialty="" />
            <PatientCard name="นางสาวสมตรา มากมี" specialty="" />
          </div>
        </section>
      </main>
    </div>
  )
}
