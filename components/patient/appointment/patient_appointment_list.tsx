import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Patient_Edit_Appointment } from '@/components/patient/appointment/patient_edit_appointment';
import { useState, useEffect } from "react";
import { Clock, DollarSign, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Appointment } from "@/lib/types"
import { usePaymentModal } from '@/components/patient/paymentmodal/paymentmodalcontext';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { VitalsSignsModal } from '@/components/patient/vitalsSignsModal';

interface PatientAppointmentListProps {
    activeTab: 'upcoming' | 'history';
}

export function PatientAppointmentList({ activeTab }: PatientAppointmentListProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const { data: session, status } = useSession();
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openPaymentModal } = usePaymentModal();

    useEffect(() => {
        async function fetchAppointments() {
            if (status !== 'authenticated' || !session?.user?.id) {
                if (status !== 'loading') {
                    setIsLoading(false);
                }
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const patientId = session.user.id;
                const response = await fetch(`/api/appointments/patient/${patientId}`);

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
        if (status === 'authenticated') {
            fetchAppointments();
        }

    }, [session, status]);

    const handleConfirm = async (record: number) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/appointments/${record}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patient_status: 'Confirmed' }),
            });

            if (!response.ok) {
                throw new Error('ยืนยันไม่สำเร็จ');
            }
            setAppointments(prevAppointments =>
                prevAppointments.map(appt =>
                    appt.id === record
                        ? { ...appt, patient_status: "Confirmed" }
                        : appt
                )
            );

        } catch (error) {
            console.error('Confirm error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Confirmed':
                return <Badge variant="outline">ยืนยันแล้ว</Badge>;
            case 'Pending':
                return <Badge variant="outline">รอการตรวจสอบ</Badge>;
            case 'Complete':
                return <Badge variant="secondary">เสร็จสิ้น</Badge>;
            case 'Cancelled':
                return <Badge variant="destructive" className="opacity-70">ยกเลิกแล้ว</Badge>;
            default:
                return null;
        }
    };

    const getCardStyle = (status: string) => {
        switch (status) {
            case 'Confirmed':
                return 'bg-green-100 border-green-500';
            case 'Pending':
                return 'bg-yellow-100 border-yellow-500';
            case 'Complete':
                return 'bg-blue-100 border-blue-500';
            case 'Cancelled':
                return 'bg-red-100 border-red-500';
            default:
                return 'bg-white';
        }
    };

    const filteredRecords = appointments.filter(record => {
        if (activeTab === 'upcoming') {
            return record.status === 'Pending' || record.status === 'Confirmed';
        }
        if (activeTab === 'history') {
            return record.status === 'Complete' || record.status === 'Cancelled';
        }
        return false;
    });
    return (
        <div className="space-y-4">
            {error && <p className="text-red-500 ">{error}</p>}
            {isLoading ? (
                <p className="text-center text-gray-500 py-10">กำลังโหลดรายการนัดหมาย...</p>
            ) : (
                filteredRecords.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">ไม่พบรายการนัดหมายในหมวดหมู่นี้</p>
                ) : (
                    filteredRecords.map((record) => (
                        <Card key={record.id} className={`flex overflow-hidden border rounded-xl max-w-2xl mx-auto ${getCardStyle(record.status)}`}>

                            <div className="bg-indigo-600 text-white px-5 py-4 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold">
                                    {format(new Date(record.date), "dd")}
                                </span>
                                <span className="text-[1.5rem]">
                                    {format(new Date(record.date), "MMM", { locale: th })}
                                </span>
                            </div>

                            <div className="flex-1 p-5 space-y-10">
                                <div className="flex justify-between">
                                    <div>
                                        <h2 className="font-semibold text-[1.5rem]">
                                            นัดหมายกับ {record.doctorname}
                                        </h2>
                                        <p className="text-gray-600">
                                            {record.department}
                                        </p>
                                    </div>
                                    {getStatusBadge(record.status)}
                                </div>

                                <div className="flex gap-2 pt-2 border-t mt-2">
                                    {(record.status === 'Pending' || record.status === 'Confirmed') && (
                                        <>
                                            {(record.patient_status === 'Pending') && (
                                                <Button
                                                    className="bg-blue-600 text-white rounded hover:bg-blue-700 text-[1.1rem]"
                                                    onClick={() => handleConfirm(record.id)}
                                                    size="lg"
                                                >
                                                    ยืนยันเข้ารับ
                                                </Button>
                                            )}

                                            {record.is_vitals_filled ? (
                                                <Button
                                                    className=" text-[1.1rem]"
                                                    variant="outline"
                                                    size="lg"
                                                    disabled={true}
                                                >
                                                    <Stethoscope className="h-4 w-4 mr-2" />
                                                    {'กรอกข้อมูลแล้ว'}
                                                </Button>
                                            ) : (
                                                <VitalsSignsModal
                                                    appointmentId={String(record.id)}
                                                    onSuccess={() => {
                                                        console.log("Recorded!");
                                                    }}
                                                />

                                            )}

                                            <Button
                                                className=" text-[1.1rem]"
                                                onClick={() => setIsDialogOpen(true)}
                                                variant="destructive"
                                                size="lg"
                                            >
                                                เลื่อน / ยกเลิก
                                            </Button>
                                            <Patient_Edit_Appointment
                                                open={isDialogOpen}
                                                onOpenChange={setIsDialogOpen}
                                                appointmentData={record}
                                            />
                                        </>
                                    )}

                                    {record.status === 'Complete' && (
                                        <>
                                            <Link href={`/patient/treatment_record/${record.id}`} passHref>
                                                <Button
                                                    className=" text-[1.1rem]"
                                                    variant="outline"
                                                    size="lg"
                                                >
                                                    ดูรายละเอียดการรักษา
                                                </Button>
                                            </Link>
                                            <button
                                                onClick={() => openPaymentModal(record)}
                                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                <DollarSign className="w-5 h-5 mr-2" />
                                                จ่ายเงิน
                                            </button>
                                        </>
                                    )}

                                    {record.status === 'Cancelled' && (
                                        <Button variant="ghost" size="lg" disabled>
                                            นัดหมายนี้ถูกยกเลิกแล้ว
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )
            )}
        </div>
    )
}