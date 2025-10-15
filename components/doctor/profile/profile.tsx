/* eslint-disable @next/next/no-img-element */
import { Mail, Phone, Stethoscope, Building2, Calendar, Edit } from "lucide-react"

export default function DoctorProfile() {
  const doctor = {
    name: "นพ. สมชาย ใจดี",
    specialty: "อายุรกรรม",
    hospital: "โรงพยาบาลกรุงเทพ",
    email: "somchai@example.com",
    phone: "081-234-5678",
    experience: "10 ปี",
    education: "แพทยศาสตร์บัณฑิต จุฬาลงกรณ์มหาวิทยาลัย",
    image: "/doctor-placeholder.png"
  }

  return (
    <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start">
      <button
        className="absolute top-0 right-0 mt-2 mr-2 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg shadow hover:bg-blue-700 transition"
        
      >
        <Edit className="w-4 h-4" /> แก้ไขข้อมูล
      </button>

      <div className="w-40 h-40 rounded-full bg-gray-200 overflow-hidden ">
        <img
          src={doctor.image}
          className="w-full h-full object-center"
          alt={``}
        />
      </div>

      <div className="space-y-4 w-full">
        <h2 className="text-2xl font-bold">{doctor.name}</h2>
        <p className="flex items-center gap-2 text-gray-600">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          ความเชี่ยวชาญ: {doctor.specialty}
        </p>
        <p className="flex items-center gap-2 text-gray-600">
          <Building2 className="w-5 h-5 text-green-600" />
          โรงพยาบาล: {doctor.hospital}
        </p>
        <p className="flex items-center gap-2 text-gray-600">
          <Mail className="w-5 h-5 text-red-600" />
          {doctor.email}
        </p>
        <p className="flex items-center gap-2 text-gray-600">
          <Phone className="w-5 h-5 text-purple-600" />
          {doctor.phone}
        </p>
        <p className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-5 h-5 text-orange-600" />
          ประสบการณ์: {doctor.experience}
        </p>
        <p className="text-gray-600">การศึกษา: {doctor.education}</p>
      </div>
    </div>
  )
}
