import Link from 'next/link';
import { Stethoscope, LogIn, Menu } from 'lucide-react'; // เพิ่มไอคอนสำหรับโลโก้และอื่นๆ
import { Button } from '@/components/ui/button'; // สมมติว่ามีการใช้ Button component จาก shadcn/ui

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-lg sticky top-0 z-50 ">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-3 px-6">
        
        <Link href="/" className="flex items-center gap-2">
            <Stethoscope className="w-8 h-8 text-blue-600" />
            <span className="font-bold text-xl text-gray-800 dark:text-white hidden sm:inline">HealthApp</span>
        </Link>
        
        <ul className="hidden md:flex items-center gap-8 text-gray-600 dark:text-gray-300 font-medium">
          <li><Link href="/doctor" className="hover:text-blue-600 transition-colors duration-200">หน้าแรก</Link></li>
          <li><Link href="/doctor/record_treatment" className="hover:text-blue-600 transition-colors duration-200">บริการตรวจ</Link></li>
          <li><Link href="/doctor/vitals_track" className="hover:text-blue-600 transition-colors duration-200">ติดตามอาการ</Link></li>
          <li><Link href="#" className="hover:text-blue-600 transition-colors duration-200">แพทย์ผู้เชี่ยวชาญ</Link></li>
          <li><Link href="#" className="hover:text-blue-600 transition-colors duration-200">ติดต่อเรา</Link></li>
        </ul>
      
        <div className="md:hidden">
            <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
            </Button>
        </div>
      </div>
    </nav>
  )
}
