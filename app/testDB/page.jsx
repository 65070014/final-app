"use client";
import React from 'react';
import { FileText, Video, Clock, Activity, Heart, Scale, Plus, AlertCircle } from 'lucide-react';
import { useSession } from "next-auth/react";
import { PatientNav } from "@/components/patient/patient_nav"
import { useEffect, useState } from "react";
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const PatientDashboard = () => {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState([])
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [error, setError] = useState(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [history, setHistory] = useState([])
  const nextAppt = appointments[0];
  const isPending = nextAppt?.patient_status === 'Pending';

  useEffect(() => {
    if (status === 'loading') return;

    if (status !== 'authenticated' || !session?.user?.id) {
      setIsLoadingAppointments(false);
      setIsHistoryLoading(false);
      return;
    }

    const patientId = session.user.id;

    const fetchAppointments = async () => {
      setIsLoadingAppointments(true);

      try {
        const response = await fetch(`/api/appointments/patient/next/${patientId}`);
        if (!response.ok) throw new Error('ไม่สามารถดึงรายการนัดหมายได้');
        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError(error.message);
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    const fetchHistory = async () => {
      setIsHistoryLoading(true);

      try {
        const response = await fetch(`/api/patients/treatment_history/${patientId}`);
        if (!response.ok) throw new Error('ไม่สามารถดึงประวัติการรักษาได้');
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error("Error fetching history:", error);
        setError(error.message);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    fetchAppointments();
    fetchHistory();

  }, [session, status]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <PatientNav />
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">สวัสดี, คุณ{session?.user?.name || 'ผู้ใช้'}</h1>
            <p className="text-gray-500">ยินดีต้อนรับเข้าสู่ระบบดูแลสุขภาพของคุณ</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {(() => {
                const names = (session?.user?.name || "").trim().split(' ');
                return names[0].charAt(0) + (names[1] ? names[1].charAt(0) : '');
              })()}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {isLoadingAppointments ? (
              <div className="p-8 text-center bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</p>
              </div>
            ) : !nextAppt ? (
              <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4 p-6 rounded-xl border shadow-sm transition-all">
                <p className="text-gray-500 mb-2">ไม่พบรายการนัดหมายที่กำลังจะมาถึง</p>
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-all whitespace-nowrap w-full md:w-auto">
                  + จองนัดหมายใหม่
                </button>
              </div>
            ) : (
              <div className={`
      flex flex-col md:flex-row justify-between items-center w-full gap-4 p-6 rounded-xl border shadow-sm transition-all
      ${isPending ? 'bg-orange-50 border-orange-200' : 'bg-white border-blue-100'}
    `}>

                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full shrink-0 ${isPending ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    {isPending ? <AlertCircle size={24} /> : <Video size={24} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-800">
                        {isPending ? 'กรุณายืนยันนัดหมาย' : 'นัดหมายถัดไป (Video Call)'}
                      </h3>
                      {isPending && (
                        <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-bold animate-pulse">
                          รอการยืนยัน
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mt-1">
                      กับ <span className="font-semibold">{nextAppt.doctorname}</span> ({nextAppt.department})
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Clock size={16} />
                      <span>
                        {nextAppt.date ? format(new Date(nextAppt.date), "dd MMM yyyy", { locale: th }) : "ไม่ระบุวันที่"}, {nextAppt.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  {isPending ? (
                    <>
                      <button className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium whitespace-nowrap">
                        ขอยกเลิก
                      </button>
                      <button className="flex-1 md:flex-none px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-md transition-all whitespace-nowrap">
                        ยืนยันนัด
                      </button>
                    </>
                  ) : (
                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-all whitespace-nowrap w-full md:w-auto">
                      เข้าร่วมวิดีโอคอล
                    </button>
                  )}
                </div>

              </div>
            )}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">ข้อมูลสุขภาพปัจจุบัน</h3>
              <button
                onClick={() => setShowVitalsModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium shadow-sm transition-all active:scale-95"
              >
                <Plus size={16} />
                <span>บันทึกค่าสุขภาพวันนี้</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard label="ความดันโลหิต" value="120/80" unit="mmHg" status="ปกติ" color="green" icon={Activity} />
              <StatCard label="ชีพจร" value="72" unit="bpm" status="ปกติ" color="red" icon={Heart} />
              <StatCard label="น้ำหนัก" value="65.5" unit="kg" status="-0.5 kg" color="orange" icon={Scale} />
            </div>

            {/* Recent Activity / Medical Records */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">ประวัติล่าสุด</h3>
                <button className="text-sm text-blue-600 hover:underline">ดูทั้งหมด</button>
              </div>
              <div className="space-y-4">
                {isHistoryLoading ? (
                  <div className="space-y-3">
                    <div className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                    <div className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                  </div>
                ) : history && history.length > 0 ? (
                  history.map((item, index) => (
                    <RecordItem
                      key={item.appointment_id || index}
                      date={format(new Date(item.date), "dd MMM yyyy", { locale: th })}
                      title={item.diag_name || "ตรวจรักษาทั่วไป"}
                      doctor={item.doctorname}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-gray-500 text-sm">ไม่พบประวัติการรักษาล่าสุด</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar Widgets) */}
          <div className="space-y-6">
            {/* Calendar Widget Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-800 mb-4">ปฏิทินนัดหมาย</h3>
              <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center text-gray-400">
                (Calendar Component)
              </div>
            </div>

            {/* Current Medications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-800 mb-4">ยาปัจจุบัน</h3>
              <ul className="space-y-3">
                <MedItem name="Paracetamol" desc="1 เม็ด หลังอาหาร (เช้า-เย็น)" />
                <MedItem name="Vitamin C" desc="1 เม็ด หลังอาหาร (เช้า)" />
              </ul>
            </div>
          </div>

        </div>
      </main >
    </div >
  );
};

const StatCard = ({ label, value, unit, status, color, icon: Icon }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow cursor-default">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-800">{value}</span>
        <span className="text-xs text-gray-400">{unit}</span>
      </div>
      <span className={`text-[10px] px-2 py-0.5 rounded-full mt-2 inline-block bg-${color}-100 text-${color}-700`}>
        {status}
      </span>
    </div>
    <div className={`p-3 rounded-full bg-${color}-50 text-${color}-500`}>
      {Icon && <Icon size={24} />}
    </div>
  </div>
);

const RecordItem = ({ date, title, doctor }) => (
  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
    <div className="flex gap-4">
      <div className="bg-blue-50 w-12 h-12 rounded-lg flex flex-col items-center justify-center text-blue-600">
        <span className="text-xs font-bold">{date.split(' ')[0]}</span>
        <span className="text-[10px]">{date.split(' ')[1]}</span>
      </div>
      <div>
        <h4 className="font-medium text-gray-800">{title}</h4>
        <p className="text-sm text-gray-500">{doctor}</p>
      </div>
    </div>
    <button className="text-gray-400 hover:text-blue-600"><FileText size={18} /></button>
  </div>
);

const MedItem = ({ name, desc }) => (
  <li className="flex gap-3 items-start pb-3 border-b border-gray-100 last:border-0">
    <div className="w-2 h-2 mt-2 rounded-full bg-green-500 shrink-0"></div>
    <div>
      <p className="text-sm font-medium text-gray-800">{name}</p>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  </li>
);

export default PatientDashboard;