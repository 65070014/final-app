"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Calendar, FileText, Activity, LogOut, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { NotificationPopup } from '@/components/patient/history/notify_history'

export function PatientNav() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* ❌ ลบปุ่มลอยตรงนี้ออกแล้วครับ 
          ตอนนี้ใช้ปุ่มตรง Logo ด้านในแทนทั้งหมด
      */}

      {/* 2. Backdrop: บังหลังเฉพาะตอนเปิดเมนู (บน Mobile/iPad) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[40] xl:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 3. Sidebar Structure */}
      <aside className={`
        /* --- Base: ความสูงเต็มจอ พื้นหลังขาว --- */
        bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out h-screen
        
        /* --- Mobile & iPad (Fixed & Overlay) --- */
        fixed top-0 left-0 z-[50]
        
        /* --- PC (Sticky & Push) --- */
        /* พอถึงจอ xl ให้เปลี่ยนเป็น sticky เพื่อ "ดัน" เนื้อหา */
        xl:sticky xl:top-0 xl:translate-x-0 xl:w-64 xl:z-0 xl:shadow-none

        /* --- Logic การยืดหด (สำหรับ Mobile/iPad) --- */
        ${isOpen 
          ? 'w-64 md:w-64 translate-x-0 shadow-2xl' /* ✅ ใส่ md:w-64 ให้แล้ว เพื่อให้ iPad กางสุด */
          : '-translate-x-full md:translate-x-0 md:w-20' /* ตอนปิด: Mobile ซ่อน, iPad เหลือ 20 */
        }
      `}>
        
        {/* Logo Section + Menu Button Combined */}
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <button 
            onClick={toggleMenu}
            // บน PC (xl) ให้ cursor เป็น default (ไม่ต้องกด)
            className={`flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white transition-colors 
              hover:bg-blue-700 xl:hover:bg-blue-600 xl:cursor-default
            `}
          >
             <span className="block xl:hidden">
                {isOpen ? <X size={20} /> : <Menu size={20} />}
             </span>
             <span className="hidden xl:block font-bold">
                T
             </span>
          </button>

          {/* ข้อความ TeleHealth */}
          <span className={`text-xl font-bold text-gray-800 transition-opacity duration-300 whitespace-nowrap
            ${isOpen ? 'opacity-100' : 'opacity-0 xl:opacity-100 hidden xl:block'}
          `}>
            TeleHealth
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
          <NavItem href="/patient" icon={<Home size={20} />} text="หน้าหลัก" isOpen={isOpen} />
          <NavItem href="/patient/appointment" icon={<Calendar size={20} />} text="นัดหมายแพทย์" isOpen={isOpen} />
          <NavItem href="/patient/treatment_record" icon={<FileText size={20} />} text="ประวัติการรักษา" isOpen={isOpen} />
          <NavItem href="/patient/medication" icon={<Activity size={20} />} text="ใบสั่งยา" isOpen={isOpen} />
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200">
          <div className={`transition-all duration-300 mb-2 ${isOpen ? 'block' : 'hidden xl:block'}`}>
             <NotificationPopup />
          </div>
          <NavItem icon={<LogOut size={20} />} text="ออกจากระบบ" color="text-red-500 hover:bg-red-50" isOpen={isOpen} />
        </div>
      </aside>
    </>
  )
}

const NavItem = ({ icon, text, href = "#", color = "text-gray-600 hover:bg-gray-50", isOpen }) => {
  const pathname = usePathname();
  const isActive = href !== "#" && pathname === href;

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : color}`}
    >
      <div className="flex-shrink-0">{icon}</div>
      
      <span className={`whitespace-nowrap transition-all duration-300 
        ${isOpen ? 'opacity-100 ml-0' : 'opacity-0 xl:opacity-100 hidden xl:block'}
      `}>
        {text}
      </span>

      {!isOpen && (
        <div className="xl:hidden absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded 
                        whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none 
                        transition-opacity z-[70] shadow-xl">
          {text}
        </div>
      )}
    </Link>
  );
};