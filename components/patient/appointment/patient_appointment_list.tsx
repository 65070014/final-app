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
            case 'UPCOMING':
            case 'Confirmed':
                return <Badge variant="default" className="bg-green-500 hover:bg-green-600">ยืนยันแล้ว</Badge>;
            case 'Complete':
                return <Badge variant="secondary">เสร็จสิ้น</Badge>;
            case 'Cancelled':
                return <Badge variant="destructive">ยกเลิกแล้ว</Badge>;
            default:
                return <Badge variant="outline">รอการตรวจสอบ</Badge>;
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {isLoading ? (
                <p className="text-center text-gray-500 py-10">กำลังโหลดรายการนัดหมาย...</p>
            ) : (
                filteredRecords.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">ไม่พบรายการนัดหมายในหมวดหมู่นี้</p>
                ) : (
                    filteredRecords.map((record) => (
                        <Card key={record.id} className="p-4 space-y-3 shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h2 className="font-bold text-xl text-gray-700">นัดหมายกับ {record.doctorname}</h2>
                                    <p className="text-sm text-muted-foreground">{record.department}</p>
                                </div>
                                {getStatusBadge(record.status)}
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                                <Clock className="h-4 w-4 text-indigo-500" />
                                <span className="font-semibold text-base">{format(new Date(record.date), "dd MMM yyyy", { locale: th })}</span>
                                <span className="text-gray-600">เวลา {record.time}</span>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t mt-3">

                                {(record.status === 'Pending' || record.status === 'Confirmed') && (
                                    <>
                                        {(record.patient_status === 'Pending') && (
                                            <Button
                                                className="bg-blue-600 text-white rounded hover:bg-blue-700"
                                                onClick={() => handleConfirm(record.id)}
                                                size="sm"
                                            >
                                                ยืนยันเข้ารับ
                                            </Button>
                                        )}

                                        {record.is_vitals_filled ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={true}
                                            >
                                                <Stethoscope className="h-4 w-4 mr-2" />
                                                {'กรอกข้อมูลแล้ว'}
                                            </Button>
                                        ) : (

                                            <Link href={`/patient/vitals_signs/${record.id}`}>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                >
                                                    <Stethoscope className="h-4 w-4 mr-2" />
                                                    {'กรอกสัญญาณชีพ'}
                                                </Button>
                                            </Link>
                                        )}

                                        <Button
                                            onClick={() => setIsDialogOpen(true)}
                                            variant="destructive"
                                            size="sm"
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
                                            variant="outline"
                                            size="sm"
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
                                    <Button variant="ghost" size="sm" disabled>
                                        นัดหมายนี้ถูกยกเลิกแล้ว
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))
                )
            )}
        </div>
    )
}