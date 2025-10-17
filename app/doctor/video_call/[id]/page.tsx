'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { Menu, X, Video, FileEdit, User, ChevronDown, ChevronUp } from 'lucide-react';
import { AppointmentList, PatientVitalSummary } from "@/lib/types"
import { DiagnosisSection } from '@/components/doctor/medical_record/diagnosis_section';
import { MedicationSection } from '@/components/doctor/medical_record/medication_section';
import Link from 'next/link';


export default function VideoConsultationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const { id: doctorId } = params;
    const [appointment, setAppointments] = useState<AppointmentList[]>([])
    const [isloading, setIsLoading] = useState(true)
    const [isloadingpatient, setIsLoadingPatient] = useState(true)
    const [, setError] = useState<string | null>(null);
    const selectedAppointmentId = searchParams.get('appointmentId');
    const [isDiagnosPanelOpen, setIsDiagnosPanelOpen] = useState(true);
    const [isVideoExpanded, setIsVideoExpanded] = useState(true);
    const videoHeightClass = isVideoExpanded ? 'h-4/5 min-h-[350px]' : 'h-2/4 min-h-[150px]';
    const [patient, setPatient] = useState<PatientVitalSummary>()


    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [diagnosisNote, setDiagnosisNote] = useState({
        diagName: "",
        diagCode: "",
        treatmentNote: "",
    })

    const [medications, setMedications] = useState<
        Array<{
            id: string
            name: string
            dosage: string
            usage: string
            quantity: string
            note: string
        }>
    >([])

    useEffect(() => {
        async function fetchAppointments() {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/appointments/medical_personnel_id/today/${doctorId}`);

                if (!response.ok) {
                    throw new Error('ไม่สามารถดึงรายการนัดหมายได้');
                }

                const data = await response.json();
                setAppointments(data);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                console.error("Error fetching appointments:", error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAppointments();
    }, [doctorId]);

    useEffect(() => {
        async function fetchPatientVitals() {
            setIsLoadingPatient(true);
            setError(null);
            try {
                const response = await fetch(`/api/appointments/onePatient/${selectedAppointmentId}`);

                if (!response.ok) {
                    throw new Error('ไม่สามารถดึงข้อมูลผู้ป่วยได้');
                }

                const data = await response.json();
                setPatient(data[0]);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                console.error("Error fetching appointments:", error);
                setError(error.message);
            } finally {
                setIsLoadingPatient(false);
            }
        }
        fetchPatientVitals();
    }, [selectedAppointmentId]);

    const handleSwitchQueue = useCallback((newAppointmentId: string) => {
        if (newAppointmentId === selectedAppointmentId) {
            setIsPanelOpen(false);
            return;
        }

        const params = new URLSearchParams(searchParams.toString());
        params.set('appointmentId', newAppointmentId);
        router.replace(`?${params.toString()}`);

        setIsPanelOpen(false);
    }, [router, searchParams, selectedAppointmentId]);

    const handleOpenDiagnosis = useCallback(() => {
        if (!selectedAppointmentId) return;

        const url = `/doctor/record_treatment/${selectedAppointmentId}`;
        window.open(url, '_blank', 'width=1000,height=700');
    }, [selectedAppointmentId]);


    return (
        <div className="min-h-screen bg-gray-50 flex overflow-hidden">

            <div className="min-h-screen bg-gray-50 flex overflow-hidden">
                {!isPanelOpen && (
                    <button
                        onClick={() => setIsPanelOpen(true)}
                        className="fixed top-4 left-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                )}
                {isPanelOpen && (
                    <div className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
                        onClick={() => setIsPanelOpen(false)}
                    >
                        <div
                            className="absolute left-0 top-0 bottom-0 w-96 flex-shrink-0 bg-gray-100 p-4 border-r border-gray-300 shadow-xl z-50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <Video className="w-5 h-5 mr-2 text-blue-600" /> รายการคิววันนี้
                                </h3>
                                <button
                                    onClick={() => setIsPanelOpen(false)}
                                    className="p-1 rounded-full text-gray-600 hover:bg-gray-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-2 max-h-[90vh] overflow-y-auto pr-2">
                                {isloading ? (
                                    <p className="text-center text-gray-500 py-10">กำลังโหลดรายการนัดหมาย...</p>
                                ) : (
                                    appointment.length === 0 ? (
                                        <div className="text-center py-6 text-gray-500 bg-white p-4 rounded-lg border border-dashed border-gray-300">
                                            <p className="font-medium">วันนี้ไม่มีนัดหมาย</p>
                                        </div>
                                    ) : (
                                        appointment.map((appt) => (
                                            <div
                                                key={appt.id}
                                                onClick={() => appt.patient_status !== 'Canceled' && handleSwitchQueue(appt.id)}
                                                className={`p-3 rounded-lg border cursor-pointer transition-colors 
                                            ${appt.id === selectedAppointmentId ? 'bg-blue-100 border-blue-400 shadow-md' : 'bg-white hover:bg-gray-50'}
                                            ${appt.patient_status === 'Canceled' ? 'opacity-50' : ''}
                                        `}
                                            >
                                                <div className="font-bold">{appt.time} - {appt.patient}</div>
                                                <div className="text-sm text-gray-600 truncate">{appt.symptoms}</div>
                                                <div className="mt-1 text-xs">
                                                    <span className={`px-2 py-0.5 rounded-full ${appt.id === selectedAppointmentId ? 'bg-blue-600 text-white' : 'bg-green-200 text-green-800'}`}>
                                                        {appt.id === selectedAppointmentId ? 'กำลังตรวจ' : appt.patient_status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={`flex-grow flex flex-col p-6 space-y-4 transition-all duration-300 ${isDiagnosPanelOpen ? 'lg:ml-0' : 'ml-0'}`}>

                {!isDiagnosPanelOpen && (
                    <button
                        onClick={() => setIsDiagnosPanelOpen(true)}
                        className="fixed top-4 left-4 z-10 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                )}

                <div
                    className={`w-full ${videoHeightClass} bg-black rounded-lg shadow-xl relative overflow-hidden flex-shrink-0 transition-all duration-300`}
                >
                    <button
                        onClick={() => setIsVideoExpanded(!isVideoExpanded)}
                        className="absolute bottom-2 right-2 z-20 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
                        title={isVideoExpanded ? "ย่อหน้าจอ" : "ขยายหน้าจอ"}
                    >
                        {isVideoExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                        ) : (
                            <ChevronDown className="w-5 h-5" />
                        )}
                    </button>
                    <span className="text-white text-2xl absolute inset-0 flex items-center justify-center">วีดีโอคอล (คนไข้)</span>
                    <div className="absolute top-4 right-4 w-32 h-24 bg-gray-700 rounded-md border-2 border-white flex items-center justify-center z-10">
                        <User className='w-6 h-6 text-white/70' />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <DiagnosisSection diagnosisNote={diagnosisNote} setDiagnosisNote={setDiagnosisNote} />
                        <MedicationSection medications={medications} setMedications={setMedications} />
                    </div>
                    <div className="h-10"></div>
                </div>
            </div>

            <div className="w-80 flex-shrink-0 bg-white border-l border-gray-200 p-4 space-y-6 shadow-lg z-10">
                <h3 className="text-xl font-bold border-b pb-2 text-gray-800">ผู้ป่วย: {patient ? patient.patient : 'ไม่ได้เลือก'}</h3>

                {selectedAppointmentId && (
                    <button
                        onClick={handleOpenDiagnosis}
                        className="w-full flex items-center justify-center p-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-md"
                    >
                        <FileEdit className="w-5 h-5 mr-2" />
                        บันทึกการรักษาหลัก
                    </button>
                )}

                {!selectedAppointmentId && (
                    <div className="text-center text-gray-500 pt-10">
                        กรุณาเลือกคิวในแถบด้านข้างเพื่อเริ่มการตรวจ
                    </div>
                )}
                <div className="text-sm space-y-3 pt-4 border-t border-gray-200">
                    <h4 className="text-lg font-bold text-gray-800">ข้อมูลผู้ป่วย</h4>
                    {isloadingpatient || !selectedAppointmentId ? (
                        <p className="text-center text-gray-500 py-10">กำลังโหลดรายการนัดหมาย...</p>
                    ) : (
                        <>
                            <div className="space-y-1">
                                <p className="text-gray-600">
                                    <span className="font-medium text-gray-800">อายุ:</span> {patient?.age ?? 'N/A'} ปี
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium text-gray-800">รหัสผู้ป่วย:</span> {patient?.patient_id ?? 'N/A'}
                                </p>
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                                <p className="font-medium text-gray-700 flex items-center gap-1">
                                    โรคประจำตัว:
                                    <span className="font-normal text-sm text-gray-600">
                                        {patient?.underlying_diseases || 'ไม่พบ'}
                                    </span>
                                </p>
                                <p className="font-medium text-red-600 flex items-center gap-1 mt-1">
                                    แพ้ยา:
                                    <span className="font-normal text-sm text-red-700">
                                        {patient?.allergies || 'ไม่พบ'}
                                    </span>
                                </p>
                            </div>

                            <div className="pt-2 border-t border-gray-100">
                                <p className="font-medium text-gray-700 mb-1">อาการ/ข้อร้องเรียนล่าสุด:</p>
                                <div className="p-2 bg-gray-100 rounded-md text-gray-700 text-xs italic">
                                    {patient?.symptoms || 'ไม่ระบุอาการหลัก'}
                                </div>
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                                <h4 className="font-bold text-gray-800 mb-2">สัญญาณชีพล่าสุด</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                    <div className="col-span-2">
                                        <span className="text-gray-500">ความดัน:</span>
                                        <span className="font-semibold text-gray-800 ml-1">
                                            {patient?.sbp ?? 'N/A'} / {patient?.dbp ?? 'N/A'} mmHg
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">น้ำหนัก:</span>
                                        <span className="font-semibold text-gray-800">
                                            {patient?.weight ? `${patient.weight} kg` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">อุณหภูมิ:</span>
                                        <span className="font-semibold text-gray-800">
                                            {patient?.temp ? `${patient.temp} °C` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">ชีพจร (PR):</span>
                                        <span className="font-semibold text-gray-800">
                                            {patient?.pr ? `${patient.pr} bpm` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">หายใจ (RR):</span>
                                        <span className="font-semibold text-gray-800">
                                            {patient?.rr ? `${patient.rr} /min` : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {patient && (
                                <Link href={`/doctor/treatment_history/${patient.patient_id}`}>
                                    <button
                                        className="w-full flex items-center justify-center p-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors shadow-md mt-6"

                                    >
                                        <FileEdit className="w-5 h-5 mr-2" />
                                        ประวัติการรักษาผู้ป่วย
                                    </button>
                                </Link>
                            )}

                        </>
                    )}
                </div>
            </div>
        </div>
    );
}