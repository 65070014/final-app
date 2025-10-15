'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { Menu, X, Video, FileEdit, } from 'lucide-react';
import { AppointmentList } from "@/lib/types"


export default function VideoConsultationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const { id } = params;
    const [appointment, setAppointments] = useState<AppointmentList[]>([])
    const [isloading, setIsLoading] = useState(true)
    const [, setError] = useState<string | null>(null);
    const appointmentId = searchParams.get('appointmentId');
    

    const [isPanelOpen, setIsPanelOpen] = useState(true);

    useEffect(() => {
        async function fetchAppointments() {
            //เดียวมาแก้หลังจากใส่ Login Doctor
            {/* if (status !== 'authenticated' || !session?.user?.id) {
                if (status !== 'loading') {
                    setIsLoading(false);
                }
                return;
            }*/}

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/appointments/medical_personnel_id/today/${id}`);

                if (!response.ok) {
                    throw new Error('ไม่สามารถดึงรายการนัดหมายได้');
                }

                const data = await response.json();
                setAppointments(data);
                console.log(data)

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                console.error("Error fetching appointments:", error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }
        //เดียวมาแก้หลังจากใส่ Login Doctor
        {/*if (status === 'authenticated') { 
            fetchAppointments();
        }
        */}
        fetchAppointments();

    }, [id]);

    const handleSwitchQueue = useCallback((newAppointmentId: string) => {
        if (newAppointmentId === appointmentId) {
            setIsPanelOpen(false);
            return;
        }

        const params = new URLSearchParams(searchParams.toString());
        params.set('appointmentId', newAppointmentId);
        router.replace(`?${params.toString()}`);

        setIsPanelOpen(false); // ปิด Panel หลังสลับคิว
    }, [router, searchParams, appointmentId]);

    const handleOpenDiagnosis = useCallback(() => {
        if (!appointmentId) return;

        const url = `/doctor/record_treatment/${appointmentId}`;
        window.open(url, '_blank', 'width=1000,height=700');
    }, [appointmentId]);

    return (
        <div className="min-h-screen bg-gray-50 flex">

            <div className={`
                w-96 flex-shrink-0 bg-gray-100 p-4 border-r border-gray-300 transition-all duration-300 
                ${isPanelOpen ? 'translate-x-0' : '-translate-x-full absolute'}
            `}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                        <Video className="w-5 h-5 mr-2" /> รายการคิววันนี้
                    </h3>
                    <button
                        onClick={() => setIsPanelOpen(false)}
                        className="p-1 rounded-full text-gray-600 hover:bg-gray-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-2 max-h-[85vh] overflow-y-auto pr-2">
                    {isloading ? (
                        <p className="text-center text-gray-500 py-10">กำลังโหลดรายการนัดหมาย...</p>
                    ) : (
                        <>
                            {appointment.length === 0 ? (
                                <div className="text-center py-6 text-gray-500 bg-white p-4 rounded-lg border border-dashed border-gray-300">
                                    <p className="font-medium">วันนี้ไม่มีนัดหมายวิดีโอคอลล์</p>
                                </div>
                            ) : (
                                appointment.map((appt) => (
                                    <div
                                        key={appt.id}
                                        onClick={() => appt.patient_status !== 'Canceled' && handleSwitchQueue(appt.id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-colors 
                            ${appt.id === appointmentId ? 'bg-blue-100 border-blue-400 shadow-md' : 'bg-white hover:bg-gray-50'}
                            ${appt.patient_status === 'Canceled' ? 'opacity-50' : ''}
                        `}
                                    >
                                        <div className="font-bold">{appt.time} - {appt.patient}</div>
                                        <div className="text-sm text-gray-600 truncate">{appt.symptoms}</div>
                                        <div className="mt-1 text-xs">
                                            <span className={`px-2 py-0.5 rounded-full ${appt.id === appointmentId ? 'bg-blue-600 text-white' : 'bg-green-200 text-green-800'}`}>
                                                {appt.id === appointmentId ? 'กำลังตรวจ' : appt.patient_status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className={`flex-grow flex flex-col p-6 space-y-4 ${isPanelOpen ? 'ml-0' : 'ml-[-4rem]'}`}>
                {!isPanelOpen && (
                    <button
                        onClick={() => setIsPanelOpen(true)}
                        className="fixed top-4 left-4 z-10 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                )}

                <div className="w-full aspect-video bg-black rounded-lg shadow-xl flex items-center justify-center">
                    <span className="text-white text-2xl">วีดีโอคอล</span>
                </div>
            </div>

            <div className="w-80 flex-shrink-0 bg-white border-l border-gray-200 p-4 space-y-6 shadow-lg rounded-lg">
                <h3 className="text-xl font-semibold border-b pb-2 text-gray-800">เครื่องมือตรวจรักษา</h3>

                {appointmentId && (
                    <button
                        onClick={handleOpenDiagnosis}
                        className="w-full flex items-center justify-center p-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-md"
                    >
                        <FileEdit className="w-5 h-5 mr-2" />
                        บันทึกการวินิจฉัย
                    </button>
                )}

                {!appointmentId && (
                    <div className="text-center text-gray-500 pt-10">
                        กรุณาเลือกคิวในแถบด้านข้างเพื่อเริ่มการตรวจ
                    </div>
                )}
            </div>
        </div>
    );
}