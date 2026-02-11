'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { AppointmentList, PatientVitalSummary } from "@/lib/types"
import { DiagnosisSection } from '@/components/doctor/medical_record/diagnosis_section';
import { MedicationSection } from '@/components/doctor/medical_record/medication_section';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import { Menu, X, Video, FileEdit, User, Mic, MicOff, VideoOff, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';


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
    const [patient, setPatient] = useState<PatientVitalSummary>()

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);

    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

    const [connectionStatus, setConnectionStatus] = useState("Ready to call");
    const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
    const [isCallStarted, setIsCallStarted] = useState(false);
    const TURN_USERNAME = process.env.NEXT_PUBLIC_METERED_USERNAME;
    const TURN_PASSWORD = process.env.NEXT_PUBLIC_METERED_PASSWORD;

    const toggleMic = () => {
        const stream = localStreamRef.current;
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleCamera = () => {
        const stream = localStreamRef.current;
        if (stream) {
            stream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsCameraOff(!isCameraOff);
        }
    };


    const peerConnectionConfig = {
        iceServers: [
            {
                urls: "stun:stun.relay.metered.ca:80",
            },
            {
                urls: "turn:standard.relay.metered.ca:80",
                username: TURN_USERNAME,
                credential: TURN_PASSWORD,
            },
            {
                urls: "turn:standard.relay.metered.ca:80?transport=tcp",
                username: TURN_USERNAME,
                credential: TURN_PASSWORD,
            },
            {
                urls: "turn:standard.relay.metered.ca:443",
                username: TURN_USERNAME,
                credential: TURN_PASSWORD,
            },
            {
                urls: "turns:standard.relay.metered.ca:443?transport=tcp",
                username: TURN_USERNAME,
                credential: TURN_PASSWORD,
            },
        ]
    };

    useEffect(() => {
        if (!currentRoomId) return;

        // 🔒 สร้างตัวแปร Local เพื่อคุมการเกิด/ดับ ของ Effect รอบนี้โดยเฉพาะ
        const socket = io(SOCKET_URL);
        const pc = new RTCPeerConnection(peerConnectionConfig);

        // อัปเดต Ref ให้คนอื่นใช้ (แต่เราจะไม่ใช้ Ref ในการ Cleanup)
        socketRef.current = socket;
        peerConnectionRef.current = pc;

        const initWebRTC = async () => {
            try {
                // 1. Prepare Stream
                let stream = localStreamRef.current;
                if (!stream) {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    localStreamRef.current = stream;
                }
                if (pc.signalingState === 'closed') {
                    console.warn("⚠️ Connection closed while loading camera. Aborting.");
                    return;
                }

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // ใส่ Stream เข้า PC
                stream.getTracks().forEach(track => pc.addTrack(track, stream));

                // 2. Setup Events
                socket.emit("join_room", currentRoomId); // ใช้ตัวแปร socket local

                // ---------------- Events ----------------

                // เมื่อมีคนอื่นเข้ามา -> เราเป็นคนโทร (Offerer)
                socket.on("user_joined", async (userId) => {
                    //  กันตัวเอง: ถ้า userId คือตัวเราเอง ให้ข้าม (เผื่อ Server เอ๋อ)
                    if (userId === socket.id) return;

                    console.log("🔔 User Joined -> I am calling.");

                    // เช็คว่า PC พร้อมไหม
                    if (pc.signalingState !== "stable") return;

                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket.emit("offer", { offer, roomId: currentRoomId });
                });

                // เมื่อได้รับ Offer -> เราเป็นคนรับ (Answerer)
                socket.on("offer", async (offer) => {
                    // 🛡️ ถ้าเราเป็นคนโทรออกเองอยู่แล้ว (Glare) ให้หยุด หรือ Reset
                    if (pc.signalingState !== "stable") {
                        console.warn("⚠️ Collision detected. Ignore/Reset.");
                        return;
                    }

                    console.log("📩 Received Offer -> Answering.");
                    await pc.setRemoteDescription(new RTCSessionDescription(offer));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit("answer", { answer, roomId: currentRoomId });
                });

                socket.on("answer", async (answer) => {
                    console.log("✅ Received Answer");
                    if (pc.signalingState !== "stable") { // เช็คก่อน set
                        await pc.setRemoteDescription(new RTCSessionDescription(answer));
                    }
                });

                socket.on("candidate", async (candidate) => {
                    if (pc.remoteDescription) {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                });

                // PC Events
                pc.ontrack = (event) => {
                    console.log("🎥 Stream Received");
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                    }
                    setHasRemoteVideo(true);
                };

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit("candidate", { candidate: event.candidate, roomId: currentRoomId });
                    }
                };

            } catch (err) {
                console.error(err);
            }
        };

        initWebRTC();

        // 🧹 CLEANUP (จุดสำคัญที่สุด!)
        return () => {
            console.log("🧹 Cleanup old connection...");

            // สั่งปิดตัวแปร Local ที่สร้างในรอบนี้แน่ๆ
            socket.disconnect();
            pc.close();

            // (Optional) ล้าง Ref
            // socketRef.current = null;
        };
    }, [currentRoomId]);

    useEffect(() => {
        // ถ้าเริ่มโทรแล้ว และเรามี Stream กล้องเก็บไว้ในตัวแปร ref
        if (isCallStarted && localVideoRef.current && localStreamRef.current) {
            console.log("Re-attaching stream to new video element");
            localVideoRef.current.srcObject = localStreamRef.current;
        }
    }, [isCallStarted]);

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
            unit: string
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

    const handleSwitchQueue = useCallback((newAppointmentId: string, meeting_id: string) => {
        if (newAppointmentId === selectedAppointmentId) {
            setIsPanelOpen(false);
            return;
        }

        const params = new URLSearchParams(searchParams.toString());
        params.set('appointmentId', newAppointmentId);
        router.replace(`?${params.toString()}`);
        setCurrentRoomId(meeting_id);
        setIsPanelOpen(false);
    }, [router, searchParams, selectedAppointmentId]);

    const handleOpenDiagnosis = () => {

        sessionStorage.setItem('initialDiagnosisNote', JSON.stringify(diagnosisNote));
        sessionStorage.setItem('initialMedications', JSON.stringify(medications));

        router.push(`/doctor/record_treatment/${selectedAppointmentId}`);
    };


    return (
        <div className="min-h-screen bg-gray-300 flex flex-col lg:flex-row overflow-hidden">
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
                                            onClick={() => appt.patient_status !== 'Canceled' && handleSwitchQueue(appt.id, appt.meeting_id)}
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

            <div className={`flex-grow flex flex-col p-6 space-y-4 transition-all duration-300 ${isDiagnosPanelOpen ? 'lg:ml-0' : 'ml-0'}`}>

                {!isDiagnosPanelOpen && (
                    <button
                        onClick={() => setIsDiagnosPanelOpen(true)}
                        className="fixed top-4 left-4 z-10 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                )}

                <div className={`w-full h-[65vh] lg:h-2/3 min-h-[150px] bg-black rounded-lg shadow-xl relative overflow-hidden flex-shrink-0`}>

                    <span className="text-white text-2xl absolute inset-0 flex items-center justify-center">
                        {
                            !currentRoomId ? (
                                <div className="flex flex-col items-center text-white-400">
                                    <p className="text-3xl font-medium">กรุณาเลือกผู้ป่วย</p>
                                    <p className="text-xl">จากรายการด้านซ้ายเพื่อเริ่มตรวจ</p>
                                </div>
                            ) : (
                                <div className="relative w-full h-full flex flex-row bg-gray-900">

                                    {/*กล้องคนไข้ */}
                                    <div className="flex-1 relative h-full bg-black overflow-hidden">
                                        {!hasRemoteVideo && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                                                <div className="text-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                                    <p className="text-gray-400 italic text-sm">Waiting for patient...</p>
                                                </div>
                                            </div>
                                        )}
                                        <video
                                            ref={remoteVideoRef}
                                            autoPlay
                                            playsInline
                                            onCanPlay={() => setHasRemoteVideo(true)}
                                            onWaiting={() => setHasRemoteVideo(false)}
                                            className={`w-full h-full object-cover transition-opacity duration-500 ${hasRemoteVideo ? 'opacity-100' : 'opacity-0'
                                                }`}
                                        />
                                        <div className="absolute bottom-2 left-2 text-[12px] bg-black/50 px-2 py-0.5 rounded text-white z-20">
                                            Patient
                                        </div>
                                    </div>

                                    {/* หมอ*/}
                                    <div className="relative bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg w-full aspect-video md:absolute md:w-[260px] md:bottom-6 md:right-6 md:z-20 lg:w-[320px] lg:bottom-8 lg:right-8">
                                        <div className="w-full aspect-video bg-black relative shadow-lg">
                                            <video
                                                ref={localVideoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className={`w-full h-full object-cover ${isCameraOff ? 'hidden' : 'block'}`}
                                            />

                                            {isCameraOff && (
                                                <div className="w-full h-full bg-slate-800 flex items-center justify-center flex-col">
                                                    <VideoOff className="h-12 w-12 text-red-500 mb-2" />
                                                    <span className="text-sm text-slate-500">กล้องปิดอยู่</span>
                                                </div>
                                            )}
                                            <div className="absolute bottom-1 left-1 text-[10px] bg-black/50 px-2 py-0.5 rounded text-white">
                                                You
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            )}
                    </span>
                    {/* Bottom Control Bar */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-700 shadow-2xl">
                        <ControlButton
                            active={isMuted}
                            onClick={toggleMic}
                            onIcon={<MicOff />}
                            offIcon={<Mic />}
                            danger={isMuted}
                        />
                        <ControlButton
                            active={isCameraOff}
                            onClick={toggleCamera}
                            onIcon={<VideoOff />}
                            offIcon={<Video />}
                            danger={isCameraOff}
                        />
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

            <div className="w-full lg:w-[300px] xl:w-[420px] flex-shrink-0 bg-white border-l lg:border-l border-t lg:border-t-0
            border-gray-200 
            p-4 space-y-6 shadow-lg z-10 relative">
                <h3 className="text-xl font-bold border-b pb-2 text-gray-800">ผู้ป่วย: {patient ? patient.patient : 'ไม่ได้เลือก'}</h3>

                {selectedAppointmentId && (
                    <button
                        onClick={handleOpenDiagnosis}
                        className="w-full flex items-center justify-center p-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-md"
                    >
                        <FileEdit className="w-5 h-5 mr-2" />
                        บันทึกการรักษา
                    </button>
                )}

                {!selectedAppointmentId && (
                    <div className="text-center text-gray-500 pt-10">
                        กรุณาเลือกคิวในแถบด้านข้างเพื่อเริ่มการตรวจ
                    </div>
                )}
                <div className="text-base space-y-4 pt-4 border-t border-gray-200">
                    <h4 className="text-xl font-bold text-gray-800">ข้อมูลผู้ป่วย</h4>
                    {isloadingpatient || !selectedAppointmentId ? (
                        <p className="text-center text-gray-500 py-10">กำลังโหลดรายการนัดหมาย...</p>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <p className="text-gray-700">
                                    <span className="font-medium text-gray-900">อายุ:</span> {patient?.age ?? 'N/A'} ปี
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-medium text-gray-900">รหัสผู้ป่วย:</span> {patient?.patient_id ?? 'N/A'}
                                </p>
                            </div>
                            <div className="pt-3 border-t border-gray-200">
                                <p className="font-medium text-gray-700 flex items-center gap-1">
                                    โรคประจำตัว:
                                    <span className="font-normal text-base text-gray-600 ml-2">
                                        {patient?.underlying_diseases || 'ไม่พบ'}
                                    </span>
                                </p>
                                <p className="font-medium text-red-600 flex items-center gap-1 mt-2">
                                    แพ้ยา:
                                    <span className="font-bold text-base text-red-700 ml-2">
                                        {patient?.allergies || 'ไม่พบ'}
                                    </span>
                                </p>
                            </div>

                            <div className="pt-3 border-t border-gray-200">
                                <h4 className="font-bold text-xl text-gray-800 mb-2">อาการ</h4>
                                <div className="p-3 bg-red-50/50 rounded-lg text-gray-800 text-sm italic">
                                    {patient?.symptoms || 'ไม่ระบุอาการหลัก'}
                                </div>
                            </div>
                            <div className="pt-3 border-t border-gray-200">
                                <h4 className="font-bold text-xl text-gray-800 mb-3">สัญญาณชีพ</h4>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-base">
                                    <div className="col-span-2">
                                        <span className="text-gray-600">ความดัน:</span>
                                        <span className="font-bold text-lg text-gray-800 ml-2">
                                            {patient?.sbp ?? 'N/A'} / {patient?.dbp ?? 'N/A'} mmHg
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">น้ำหนัก:</span>
                                        <span className="font-bold text-gray-800">
                                            {patient?.weight ? `${patient.weight} kg` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">อุณหภูมิ:</span>
                                        <span className="font-bold text-gray-800">
                                            {patient?.temp ? `${patient.temp} °C` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">ชีพจร (PR):</span>
                                        <span className="font-bold text-gray-800">
                                            {patient?.pr ? `${patient.pr} bpm` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">หายใจ (RR):</span>
                                        <span className="font-bold text-gray-800">
                                            {patient?.rr ? `${patient.rr} /min` : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {patient && (
                                <Link href={`/doctor/treatment_history/${patient.patient_id}`}>
                                    <button
                                        className="w-full flex items-center justify-center p-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg mt-6" // ➡️ เปลี่ยนเป็นสีน้ำเงินเข้มเพื่อให้เด่นขึ้น
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

const ControlButton = ({ active, onClick, onIcon, offIcon, danger }) => (
    <Button
        variant={danger ? "destructive" : "secondary"}
        size="icon"
        className={`rounded-full h-12 w-12 transition-all duration-200 ${!danger && active ? 'bg-slate-700 text-white' : ''
            } ${!danger && !active ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : ''}`}
        onClick={onClick}
    >
        {active ? onIcon : offIcon}
    </Button>
);