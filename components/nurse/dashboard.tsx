"use client"
import { useState, useEffect } from "react"
import { ClipboardList, PlusCircle, FileText, X, UserPlus, Search, Edit } from "lucide-react"
import Link from "next/link"
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { NotificationPopup } from '@/components/patient/history/notify_history'

interface RecentAppointment {
  id: number;
  patient: string;
  date: string;
  time: string;
  department: string;
  status: string;
  patient_status: string;
}

interface PatientSearchResult {
  id: number;
  name: string;
  cid: string;
}

export default function NurseDashboard() {
  const [appointments, setAppointments] = useState<RecentAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchRecentAppointments = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/appointments');
        if (!res.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลนัดหมายล่าสุดได้");
        }
        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecentAppointments();
  }, []);

  useEffect(() => {
    // ถ้าช่องค้นหาว่างเปล่า ให้เคลียร์ผลลัพธ์ทิ้ง
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    // หน่วงเวลา 300ms รอให้พิมพ์เสร็จก่อนค่อยยิง API
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/patients/search?q=${searchQuery}&limit=3`);
        const data = await res.json();
        setSearchResults(data);
      } catch (error) {
        console.error("ค้นหาผิดพลาด:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // เมื่อปิด Modal ให้ล้างค่าการค้นหาทิ้งด้วย
  const handleCloseModal = () => {
    setIsRecordModalOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen  p-8  bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg shadow-lg">
      <div className="max-w-6xl mx-auto">

        <div className="bg-blue-900 text-white rounded-lg p-6 mb-8 flex justify-between items-center shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide">Nurse Dashboard</h1>
          <div className="flex items-center gap-4 md:gap-6">
            <span className="text-sm md:text-base font-medium bg-blue-800/80 px-4 py-2 rounded-full shadow-inner hidden md:block">
              ยินดีต้อนรับ, พยาบาล
            </span>
            <div className="bg-white text-gray-800 rounded-full shadow-md flex items-center justify-center p-1.5 hover:bg-gray-100 transition-colors">
              <NotificationPopup role="Nurse" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* หมายเหตุ: คุณอาจจะต้องเปลี่ยน path ให้ตรงกับโครงสร้างโปรเจกต์ของคุณ */}
          <Link href="/nurse/appointments">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md flex flex-col items-center hover:bg-purple-50 hover:-translate-y-1 transition-all cursor-pointer border-b-4 border-blue-500">
              <PlusCircle className="w-8 h-8 text-blue-600 mb-2" />
              <p className="font-medium">เพิ่มการนัดหมาย</p>
            </div>
          </Link>

          <div
            onClick={() => setIsRecordModalOpen(true)}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center hover:bg-purple-50 dark:hover:bg-gray-700 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer border-b-4 border-b-purple-500"
          >
            <FileText className="w-8 h-8 text-purple-600 mb-2" />
            <p className="font-bold text-gray-800 dark:text-gray-200 text-lg">จัดการเวชระเบียน</p>
          </div>

          <Link href="/nurse/appointment_history">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md flex flex-col items-center hover:bg-purple-50 hover:-translate-y-1 transition-all cursor-pointer border-b-4 border-green-500">
              <ClipboardList className="w-8 h-8 text-green-600 mb-2" />
              <p className="font-medium">ดูประวัติการนัดหมาย</p>
            </div>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">การนัดหมายล่าสุด</h2>
          {isLoading ? (
            <p>กำลังโหลดข้อมูล...</p>
          ) : (
            <div className="space-y-4">
              {appointments.length > 0 ? appointments.map(appt => (
                <div key={appt.id} className="p-4 border dark:border-gray-700 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-extrabold text-2xl text-gray-900 dark:text-white mb-3"> คุณ {appt.patient}</p>
                    <p className="text-sm  dark:text-gray-400">📅 {format(new Date(appt.date), "dd MMM yyyy", { locale: th })} | ⏰ {appt.time} | 🩺 {appt.department}</p>
                  </div>
                  <div className="flex items-center gap-2 text-center">
                    <div className="flex flex-col items-start lg:items-end w-1/2 lg:w-auto">
                      <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">สถานะคนไข้</p>
                      <div className={`flex items-center justify-center gap-2 px-5 py-2 rounded-full text-sm font-extrabold text-white shadow-md w-full lg:w-auto transition-colors ${appt.patient_status === "Confirmed"
                        ? "bg-emerald-500 border border-emerald-600 shadow-emerald-200"
                        : "bg-amber-500 border border-amber-600 shadow-amber-200"
                        }`}>
                        <span className={`w-2 h-2 rounded-full bg-white ${appt.patient_status === "Confirmed" ? "" : "animate-pulse"}`}></span>
                        {appt.patient_status}
                      </div>
                    </div>
                    <div className="flex flex-col items-start lg:items-end w-1/2 lg:w-auto">
                      <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">สถานะแพทย์</p>
                      <div className={`flex items-center justify-center gap-2 px-5 py-2 rounded-full text-sm font-extrabold text-white shadow-md w-full lg:w-auto transition-colors ${appt.status === "Confirmed" || appt.status === "Complete"
                        ? "bg-blue-600 border border-blue-700 shadow-blue-200"
                        : "bg-orange-500 border border-orange-600 shadow-orange-200"
                        }`}>
                        <span className={`w-2 h-2 rounded-full bg-white ${appt.status === "Confirmed" || appt.status === "Complete" ? "" : "animate-pulse"}`}></span>
                        {appt.status}
                      </div>
                    </div>
                  </div>
                </div>
              )) : <p>ไม่มีการนัดหมายล่าสุด</p>}
            </div>
          )}
          {isRecordModalOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Modal Header */}
                <div className="bg-purple-50 dark:bg-gray-700/50 p-6 flex justify-between items-center border-b border-purple-100 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 dark:bg-gray-600 p-2 rounded-xl">
                      <FileText className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">จัดการเวชระเบียน</h3>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-red-500 bg-white dark:bg-gray-600 hover:bg-red-50 dark:hover:bg-gray-500 p-2 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-8">

                  {/* ปุ่มสร้างผู้ป่วยใหม่ */}
                  <Link href="/nurse/patients/new" className="block w-full">
                    <button className="w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                      <UserPlus className="w-6 h-6" />
                      เพิ่มประวัติผู้ป่วยใหม่
                    </button>
                  </Link>

                  {/* เส้นคั่นกลาง */}
                  <div className="relative flex items-center py-6">
                    <div className="flex-grow border-t border-gray-200 dark:border-gray-600"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-400 text-sm font-medium">หรือ</span>
                    <div className="flex-grow border-t border-gray-200 dark:border-gray-600"></div>
                  </div>

                  {/* ฟอร์มค้นหาผู้ป่วยเดิม (Real-time) */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      ค้นหาผู้ป่วย (ชื่อ หรือ เลขบัตร ปชช.)
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all shadow-sm"
                        placeholder="พิมพ์ชื่อเพื่อค้นหา..."
                        autoComplete="off"
                        autoFocus
                      />
                    </div>

                    {/*แสดงผลลัพธ์การค้นหา */}
                    {searchQuery.trim() !== "" && (
                      <div className="mt-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-inner overflow-hidden max-h-[250px] overflow-y-auto">
                        {isSearching ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm flex justify-center items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                            กำลังค้นหา...
                          </div>
                        ) : searchResults.length > 0 ? (
                          <ul className="divide-y divide-gray-100 dark:divide-gray-600">
                            {searchResults.map((patient) => (
                              <li key={patient.id} className="p-4 flex justify-between items-center hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors group">
                                <div>
                                  <p className="font-bold text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                                    {patient.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    เลขบัตร: {patient.cid}
                                  </p>
                                </div>

                                {/*ปุ่มแก้ไข */}
                                <Link href={`/nurse/patient_edit/${patient.id}`}>
                                  <button className="flex items-center gap-1.5 bg-white border border-gray-300 hover:border-purple-400 text-gray-700 hover:text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm">
                                    <Edit className="w-4 h-4" />
                                    แก้ไข
                                  </button>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                            <p>ไม่พบข้อมูลผู้ป่วย <b>`{searchQuery}`</b></p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}