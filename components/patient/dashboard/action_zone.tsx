"use client";

import { Card } from "@/components/ui/card"
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Pill, FileText, Bell } from "lucide-react"
import { useEffect, useState } from "react";
import { Patient_Edit_Appointment } from '@/components/patient/appointment/patient_edit_appointment';
import { NotificationAlert } from '@/components/patient/dashboard/notification';
import { Appointment, Notification} from "@/lib/types";
import { useSession } from "next-auth/react";

export function ActionZone() {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const { data: session, status } = useSession();
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [notification, setnotification] = useState<Notification[]>([])
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
    const [isLoadingNotification, setIsLoadingNotification] = useState(true);
    const [error, setError] = useState<string | null>(null);



    useEffect(() => {
        async function fetchAppointments() {
            if (status !== 'authenticated' || !session?.user?.id) {
                if (status !== 'loading') {
                    setIsLoadingAppointments(false);
                }
                return;
            }

            setIsLoadingAppointments(true);
            setError(null);

            try {
                const patientId = session.user.id;
                const response = await fetch(`/api/appointments/patient/next/${patientId}`);

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
                setIsLoadingAppointments(false);
            }
        }
        if (status === 'authenticated') {
            fetchAppointments();
        }

    }, [session, status]);

    useEffect(() => {
        async function fetchNotification() {
            if (status !== 'authenticated' || !session?.user?.id) {
                if (status !== 'loading') {
                    setIsLoadingNotification(false);
                }
                return;
            }

            setIsLoadingNotification(true);
            setError(null);

            try {
                const patientId = session.user.id;
                const response = await fetch(`/api/notification?id=${patientId}&role=Patient`);

                if (!response.ok) {
                    throw new Error('ไม่สามารถดึงรายการนัดหมายได้');
                }

                const data = await response.json();
                setnotification(data);
                console.log(data)

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                console.error("Error fetching appointments:", error);
                setError(error.message);
            } finally {
                setIsLoadingNotification(false);
            }
        }
        if (status === 'authenticated') {
            fetchNotification();
        }

    }, [session, status]);

    

    return (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* การนัดหมาย */}
            <Card className="p-6 bg-gradient-to-r from-blue-100 to-blue-50 border-blue-25 shadow-lg">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Calendar className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">นัดหมายครั้งถัดไป</h3>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                        </div>
                    </div>
                    {isLoadingAppointments ? (
                        <p className="text-center text-gray-500 py-10">กำลังโหลดรายการนัดหมาย...</p>
                    ) : (
                        <>
                            {
                                appointments.length === 0 ? (
                                    <div className="text-center py-10 border rounded-lg bg-gray-50">
                                        <p className="text-lg font-semibold text-gray-700 mb-2">
                                            ไม่พบรายการนัดหมายที่กำลังจะมาถึง
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            กรุณาทำการจองนัดหมายใหม่
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-card p-4 rounded-lg border">

                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="font-medium text-foreground">{appointments[0].date}</p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    เวลา {appointments[0].time} น. - พบ{appointments[0].doctorname}
                                                </p>
                                            </div>
                                        </div>

                                        <Button className="w-full bg-gray-400 text-gray-700 cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-700 disabled:opacity-100 mb-2" disabled >เข้าร่วมวิดีโอคอล</Button>
                                        <Button onClick={() => setIsDialogOpen(true)} className="w-full bg-red-600 hover:bg-red-700">เลื่อน/ยกเลิกนัด</Button>
                                        <Patient_Edit_Appointment
                                            open={isDialogOpen}
                                            onOpenChange={setIsDialogOpen}
                                            appointmentData={appointments[0]}
                                        />
                                    </div>
                                )
                            }
                        </>
                    )}
                </div>
            </Card>

            {/* การแจ้งเตือน */}
            <Card className="p-6 bg-gradient-to-r from-blue-100 to-blue-50 border-blue-25 shadow-lg">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Bell className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">การแจ้งเตือน</h3>
                    </div>
                    {isLoadingNotification ? (
                        <p className="text-center text-gray-500 py-10">กำลังโหลดรายการแจ้งเตือน...</p>
                    ) : (
                        <>  
                            
                            <NotificationAlert notification={notification}/>

                            <Button onClick={() => router.push('/patient/notification')} variant="outline" className="w-full">
                                ดูการแจ้งเตือนทั้งหมด
                            </Button>
                        </>
                    )}
                </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 lg:col-span-2 bg-gradient-to-r from-blue-100 to-blue-50 border-blue-25 shadow-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4">เมนู</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button onClick={() => router.push('/patient/appointment')} variant="outline" className="h-20 flex-col bg-transparent gap-2 rounded-lg border-gray-600">
                        <FileText className="h-6 w-6 text-blue-500" />
                        <span className="text-sm">นัดหมาย</span>
                    </Button>
                    <Button onClick={() => router.push('/patient/appointments')} variant="outline" className="h-20 flex-col gap-2 bg-transparent rounded-lg border-gray-600">
                        <Calendar className="h-6 w-6 text-blue-500" />
                        <span className="text-sm">ตารางนัดหมายของฉัน</span>
                    </Button>
                    <Button onClick={() => router.push('/patient/medication')} variant="outline" className="h-20 flex-col gap-2 bg-transparent rounded-lg border-gray-600">
                        <Pill className="h-6 w-6 text-blue-500" />
                        <span className="text-sm">รายการยา</span>
                    </Button>
                    <Button onClick={() => router.push('/patient/treatment_record')} variant="outline" className="h-20 flex-col bg-transparent gap-2 rounded-lg border-gray-600">
                        <Clock className="h-6 w-6 text-blue-500" />
                        <span className="text-sm">ประวัติการรักษา</span>
                    </Button>
                </div>
            </Card>
        </div>
    )
}
