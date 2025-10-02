import { Calendar } from "lucide-react"

type Props = {
  name: string
  specialty: string
}

export default function DoctorCard({ name, specialty }: Props) {
  return (
    <div className="border rounded-lg p-4 shadow-sm flex flex-col items-center text-center">
      <div className="w-24 h-24 bg-gray-200 rounded-full mb-4" />
      <h3 className="font-bold text-black">{name}</h3>
      <p className="text-sm text-gray-500 mb-4">{specialty}</p>
      <div className="flex justify-between w-full text-sm text-gray-600">
        <button className="flex items-center gap-1">
          <Calendar className="w-4 h-4" /> นัดหมาย
        </button>
        <button className="text-blue-500">รายละเอียด</button>
      </div>
    </div>
  )
}
