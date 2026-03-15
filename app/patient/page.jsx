"use client";
import React from 'react';
import { FileText, Video, Clock, Activity, Heart, Scale, Thermometer, Calendar, AlertCircle } from 'lucide-react';
import { useSession } from "next-auth/react";
import { PatientNav } from "@/components/patient/patient_nav"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { AppointmentForm } from "@/components/patient/appointment/appointment_form"
import { VitalsSignsModal } from '@/components/patient/vitalsSignsModal';
import { CalendarDashboard } from '@/components/patient/calendar_dashboard';
import Link from 'next/link';
import { Alert } from '@/components/ui/alert';

const PatientDashboard = () => {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState([])
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [error, setError] = useState(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [history, setHistory] = useState([])
  const [isPrescriptionsLoading, setIsPrescriptionsLoading] = useState(true)
  const [prescriptions, setPrescriptions] = useState([])
  const [latestVitals, setLatestVitals] = useState(null);
  const [isLoadingVitals, setIsLoadingVitals] = useState(true);
  const nextAppt = appointments[0];
  const isPending = nextAppt?.patient_status === 'Pending';
  const isNursePending = nextAppt?.status === 'Pending';
  const [isVitalOpen, setIsVitalOpen] = useState(false);
  const router = useRouter()

  let isNotReady = false;

  if (nextAppt && nextAppt.date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointmentDate = new Date(nextAppt.date);
    appointmentDate.setHours(0, 0, 0, 0);

    isNotReady = today < appointmentDate;
  }


  const handleJoinVideo = () => {
    const handleFirstClick = () => {
      document.documentElement.requestFullscreen().catch(() => { });
      window.removeEventListener("click", handleFirstClick);
    };

    window.addEventListener("click", handleFirstClick);
    if (nextAppt.is_vitals_filled) {
      router.push(`patient/videocall/${nextAppt.meeting_id}`);
    } else {
      setIsVitalOpen(true);
    }
    return () => {
      window.removeEventListener("click", handleFirstClick);
    };
  };

  useEffect(() => {
    if (status === 'loading') return;

    if (status !== 'authenticated' || !session?.user?.id) {
      setIsLoadingAppointments(false);
      setIsHistoryLoading(false);
      return;
    }

    const patientId = session.user.id;

    const fetchAppointments = async (isSilent = false) => {
    if (!isSilent) setIsLoadingAppointments(true);
      
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

    const fetchPrescriptions = async () => {
      setIsPrescriptionsLoading(true);

      try {
        const response = await fetch(`/api/patients/dispensing_history/${patientId}`);
        if (!response.ok) throw new Error('ไม่สามารถดึงประวัติการยาได้');
        const data = await response.json();
        setPrescriptions(data);
      } catch (error) {
        console.error("Error fetching history:", error);
        setError(error.message);
      } finally {
        setIsPrescriptionsLoading(false);
      }
    };

    const fetchVitals = async () => {
      setIsLoadingVitals(true);

      try {
        const response = await fetch(`/api/patients/vitals_track/?patientId=${patientId}`);
        if (!response.ok) throw new Error('ไม่สามารถดึงประวัติการได้');
        const data = await response.json();
        if (data && data.length > 0) {
          setLatestVitals(data[0]);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
        setError(error.message);
      } finally {
        setIsLoadingVitals(false);
      }
    };

    fetchAppointments();
    fetchHistory();
    fetchPrescriptions();
    fetchVitals();

    const interval = setInterval(() => {
      fetchAppointments(true);
    }, 5000);
    return () => clearInterval(interval);

  }, [session, status]);



  return (
    <div className="flex h-screen bg-slate-200 font-sans">
      <PatientNav />
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-[1.50rem] font-bold text-gray-800">สวัสดี, คุณ {session?.user?.name || 'ผู้ใช้'}</h1>
            <p className="text-gray-500">ยินดีต้อนรับเข้าสู่ระบบดูแลสุขภาพของคุณ</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">

            {isLoadingAppointments ? (
              <div className="p-8 text-center bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</p>
              </div>
            ) : !nextAppt ? (
              <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4 p-6 rounded-xl border shadow-sm transition-all bg-white">
                <p className="text-gray-500 mb-2">ไม่พบรายการนัดหมายที่กำลังจะมาถึง</p>
                <AppointmentForm />
              </div>
            ) : (
              <div className={`
            flex flex-col md:flex-row justify-between items-center w-full gap-4 p-6 rounded-xl border shadow-sm transition-all
            ${isPending ? 'bg-orange-50 border-orange-200' : 'bg-white border-blue-100'}
          `}>

                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full shrink-0 ${isPending ? 'bg-orange-100 text-orange-600'
                    : isNursePending ? 'bg-purple-100 text-purple-600'
                      : !nextAppt.is_vitals_filled ? 'bg-amber-100 text-amber-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                    {isPending ? <AlertCircle size={24} />
                      : isNursePending ? <Clock size={24} />
                        : !nextAppt.is_vitals_filled ? <AlertCircle size={24} />
                          : <Video size={24} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[1.5rem] font-bold text-gray-800">
                        {isPending ? 'กรุณายืนยันนัดหมาย'
                          : isNursePending ? 'รอพยาบาลยืนยันนัดหมาย'
                            : !nextAppt.is_vitals_filled ? 'กรุณากรอกข้อมูลก่อนพบแพทย์'
                              : 'นัดหมายถัดไป (Video Call)'}
                      </h3>

                      {isPending ? (
                        <span className="bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full text-sm font-bold">
                          รอคุณยืนยัน
                        </span>
                      ) : isNursePending ? (
                        <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full text-sm font-bold">
                          รอพยาบาลยืนยัน
                        </span>
                      ) : !nextAppt.is_vitals_filled ? (
                        <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full text-sm font-bold">
                          รอข้อมูลสัญญาณชีพ
                        </span>
                      ) : (
                        <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-sm font-bold">
                          พร้อมเข้าร่วม
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-[1.25rem]">
                      กับ <span className="font-semibold">{nextAppt.doctorname}</span> ({nextAppt.department})
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock size={15} />
                      <span>
                        {nextAppt.date ? format(new Date(nextAppt.date), "dd MMM yyyy", { locale: th }) : "ไม่ระบุวันที่"}, {nextAppt.time}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto mt-4">
                  {isPending ? (
                    <>
                      <button className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium whitespace-nowrap">ขอยกเลิก</button>
                      <button className="flex-1 md:flex-none px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-md transition-all whitespace-nowrap">ยืนยันนัด</button>
                    </>
                  ) : isNursePending ? (
                    null
                  ) : !nextAppt.is_vitals_filled ? (
                    <VitalsSignsModal
                      appointmentId={nextAppt.id}
                      onSuccess={() => alert("บันทึกข้อมูลสำเร็จ!")}
                      buttonClassName="bg-orange-500 hover:bg-orange-600 text-white rounded-[0.75rem] font-bold shadow-sm transition-all whitespace-nowrap w-full md:w-auto flex items-center justify-center gap-[0.5rem] text-[1.4rem] py-[2.2rem] px-[1.5rem]"
                    />
                  ) : (
                    <button
                      disabled={isNotReady}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium shadow-md transition-all whitespace-nowrap w-full md:w-auto flex items-center justify-center gap-2"
                      onClick={handleJoinVideo}>
                      <Video size={18} />
                      {isNotReady ? 'ยังไม่ถึงวันนัดหมาย' : 'เข้าร่วมวิดีโอคอล'}
                    </button>
                  )}
                </div>
                <VitalsSignsModal
                  appointmentId={nextAppt.id}
                  isOpen={isVitalOpen}
                  onClose={setIsVitalOpen}
                  onSuccess={() => {
                    // Redirect ไปหน้า Video
                    router.push(`patient/videocall/${nextAppt.meeting_id}`);
                  }}
                />
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[1.25rem] font-bold text-gray-800 flex items-center gap-2">
                  <Calendar size={24} className="text-blue-600" />
                  ปฏิทินนัดหมาย
                </h3>
                <Link
                  href="/patient/appointment"
                  className=" text-blue-600 hover:underline"
                >
                  ดูนัดหมายทั้งหมด
                </Link>
              </div>
              <CalendarDashboard />
            </div>

          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-[1.5rem] font-bold text-gray-800">ข้อมูลสุขภาพ</h3>
                  {!isLoadingVitals && latestVitals && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      ล่าสุด: {latestVitals.date} ({latestVitals.time})
                    </p>
                  )}
                </div>
                <VitalsSignsModal
                  appointmentId={""}
                  onSuccess={() => Alert("Recorded!")}
                />
              </div>

              <div className="space-y-3">
                {isLoadingVitals ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-16 bg-gray-50 rounded-xl"></div>
                    <div className="h-16 bg-gray-50 rounded-xl"></div>
                    <div className="h-16 bg-gray-50 rounded-xl"></div>
                  </div>
                ) : latestVitals ? (
                  <>
                    <StatCardSmall
                      label="ความดัน"
                      value={`${latestVitals.systolic}/${latestVitals.diastolic}`}
                      unit="mmHg"
                      color="green"
                      icon={Activity}
                    />
                    <StatCardSmall
                      label="น้ำหนัก"
                      value={latestVitals.weight}
                      unit="kg"
                      color="orange"
                      icon={Scale}
                    />
                    <StatCardSmall
                      label="อุณหภูมิ"
                      value={latestVitals.temp}
                      unit="°C"
                      color="red"
                      icon={Thermometer}
                    />
                  </>
                ) : (
                  <div className="text-center py-8 border border-dashed border-gray-100 rounded-xl">
                    <p className="text-sm text-gray-400 italic">ยังไม่มีบันทึกข้อมูลสุขภาพ</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-[1.5rem] font-bold text-gray-800 mb-4 flex items-center gap-2">
                💊 ยาปัจจุบัน
                {prescriptions.length > 0 && (
                  <span className="text-xs font-normal text-gray-400">
                    (ล่าสุดเมื่อ: {prescriptions[0].appointment_date})
                  </span>
                )}
              </h3>

              <ul className="space-y-3">
                {isPrescriptionsLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-10 bg-gray-100 rounded-lg w-full"></div>
                    <div className="h-10 bg-gray-100 rounded-lg w-full"></div>
                  </div>
                ) : prescriptions.length > 0 && prescriptions[0].items.length > 0 ? (
                  prescriptions[0].items.map((item, idx) => (
                    <MedItem
                      key={idx}
                      name={item.medicine_name}
                      desc={`${item.dosage} | ${item.usage}`}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <p className=" ">ไม่มีประวัติการรับยาปัจจุบัน</p>
                  </div>
                )}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[1.5rem] font-bold text-gray-800">ประวัติล่าสุด</h3>
                <Link
                  href="/patient/treatment_record"
                  className=" text-blue-600 hover:underline"
                >
                  ดูนัดหมายทั้งหมด
                </Link>
              </div>
              <div className="space-y-4">
                {isHistoryLoading ? (
                  <div className="space-y-3">
                    <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                    <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                  </div>
                ) : history && history.length > 0 ? (
                  history.map((item, index) => (
                    <RecordItem
                      key={item.appointment_id || index}
                      date={format(new Date(item.date), "dd MMM", { locale: th })}
                      title={item.diag_name || "ตรวจรักษา"}
                      doctor={item.doctorname}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <p className=" ">ไม่พบประวัติล่าสุด</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

const StatCardSmall = ({ label, value, unit, color, icon: Icon }) => (
  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-full bg-${color}-50 text-${color}-500`}>
        <Icon size={18} />
      </div>
      <div>
        <p className=" text-gray-800">{label}</p>
        <p className="font-bold text-gray-800">{value} <span className="font-normal text-gray-800">{unit}</span></p>
      </div>
    </div>
    <div className={`h-2 w-2 rounded-full bg-${color}-500`}></div>
  </div>
);

const RecordItem = ({ date, title, doctor }) => (
  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
    <div className="flex gap-4">
      <div className="bg-blue-50 w-12 h-12 rounded-lg flex flex-col items-center justify-center text-blue-600">
        <span className="font-bold">{date.split(' ')[0]}</span>
        <span className="text-[1rem]">{date.split(' ')[1]}</span>
      </div>
      <div>
        <h4 className="font-medium text-gray-800">{title}</h4>
        <p className=" ">{doctor}</p>
      </div>
    </div>
    <button className=" hover:text-blue-600"><FileText size={18} /></button>
  </div>
);

const MedItem = ({ name, desc }) => (
  <li className="flex gap-3 items-start pb-3 border-b border-gray-100 last:border-0">
    <div className="w-2 h-2 mt-2 rounded-full bg-green-500 shrink-0"></div>
    <div>
      <p className="  ">{name}</p>
      <p className=" ">{desc}</p>
    </div>
  </li>
);

export default PatientDashboard;