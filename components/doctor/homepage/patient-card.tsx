import { Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button" // สมมติว่ามีการใช้ Button component จาก shadcn/ui

type Props = {
  name: string
  specialty: string
  imageUrl?: string // เพิ่ม imageUrl สำหรับใส่รูปภาพจริง
}

export default function DoctorCard({ name, specialty, imageUrl }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center p-6">
      
      <img
        src={imageUrl || `https://placehold.co/96x96/E2E8F0/4A5568?text=Patient`}
        alt={`Profile of ${name}`}
        className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-gray-100 dark:border-gray-700"
      />
      
      <h3 className="font-bold text-lg text-gray-800 dark:text-white">{name}</h3>
      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-4">{specialty}</p>

      <div className="mt-auto w-full space-y-2 pt-4">
        
      </div>
    </div>
  )
}
