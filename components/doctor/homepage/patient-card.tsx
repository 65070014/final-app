import { Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button" // สมมติว่ามีการใช้ Button component จาก shadcn/ui
import Link from "next/link"

type Props = {
  name: string
  specialty: string
  imageUrl?: string
  href?: string // ✅ เพิ่ม prop href
}

export default function DoctorCard({ name, specialty, imageUrl, href }: Props) {
  const content = (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center p-6 cursor-pointer">
      <img
        src={imageUrl || `https://placehold.co/96x96/E2E8F0/4A5568?text=Patient`}
        alt={`Profile of ${name}`}
        className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-gray-100 dark:border-gray-700"
      />

      <h3 className="font-bold text-lg text-gray-800 dark:text-white">{name}</h3>
      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-4">{specialty}</p>

      <div className="mt-auto w-full pt-4">
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ดูประวัติการรักษา
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return href ? (
    <Link href={href} className="block">
      {content}
    </Link>
  ) : (
    content
  )
}
