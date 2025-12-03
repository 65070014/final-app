"use client"
import React from 'react';
import Link from 'next/link';
import {
  Home,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  Activity,
  LogOut
} from 'lucide-react';
import { usePathname } from 'next/navigation';

export function PatientNav() {
    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
                <span className="text-xl font-bold text-gray-800">TeleHealth</span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                <NavItem href="/testDB" icon={<Home size={20} />} text="หน้าหลัก"/>
                <NavItem href="/patient/appointment" icon={<Calendar size={20} />} text="นัดหมายแพทย์" />
                <NavItem href="/patient/treatment_record" icon={<FileText size={20} />} text="ประวัติการรักษา" />
                <NavItem href="/patient/medication" icon={<Activity size={20} />} text="ใบสั่งยา" />
                <NavItem href="/patient/notification" icon={<MessageSquare size={20} />} text="การแจ้งเตือน" />
            </nav>

            <div className="p-4 border-t border-gray-200">
                <NavItem icon={<Settings size={20} />} text="ตั้งค่าบัญชี" />
                <NavItem icon={<LogOut size={20} />} text="ออกจากระบบ" color="text-red-500 hover:bg-red-50" />
            </div>
        </aside>
    )
}

const NavItem = ({ icon, text, href = "#", color = "text-gray-600 hover:bg-gray-50" }) => {
  const pathname = usePathname();
  const isActive = href !== "#" && pathname === href;

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : color}`}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
};