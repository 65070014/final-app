import Link from 'next/link';
import { User, Video, Pill, CalendarDays, Stethoscope } from 'lucide-react';

const menuItems = [
    { href: "/doctor/profile", icon: User, label: "ข้อมูลส่วนตัว" },
    { href: "/doctor/video_call/1", icon: Video, label: "วิดีโอคอล" },
    { href: "/doctor/dispensing", icon: Pill, label: "การจ่ายยา" },
    { href: "/doctor/schedule", icon: CalendarDays, label: "ตารางนัดหมาย" },
];

export default function Banner() {
    return (
        <div className="grid md:grid-cols-5 gap-6 p-4 bg-gradient-to-r from-blue-100 to-blue-50 border-blue-25">

            <div className="md:col-span-3  p-6 rounded-2xl shadow-2xl flex items-center justify-center bg-gradient-to-r from-blue-200 to-blue-100 border-blue-25">
                <div className="grid grid-cols-2 gap-4 w-full">
                    {menuItems.map((item) => (
                        <Link href={item.href} key={item.label}>
                            <div className="group p-6 border dark:border-black rounded-xl hover:bg-blue-50 dark:hover:bg-black hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center h-full">
                                <item.icon className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-3 transition-transform duration-300 group-hover:scale-110" />
                                <p className="font-semibold text-gray-700 dark:text-gray-200 text-center">{item.label}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center text-white">
                <Stethoscope size={64} className="opacity-80 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Doctor&apos;s Portal</h2>
                <p className="text-blue-200 max-w-xs">
                    เข้าถึงข้อมูลและจัดการการนัดหมายของผู้ป่วยได้อย่างรวดเร็วและปลอดภัย
                </p>
            </div>
        </div>
    )
}
