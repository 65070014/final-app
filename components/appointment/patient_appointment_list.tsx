import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {Patient_Edit_Appointment} from '@/components/appointment/patient_edit_appointment';
import { useState } from "react";
import { Clock, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const appointmentRecords = [
    {
        id: 1,
        date: "1 ต.ค. 2568",
        time: "10:00 น.",
        doctor: "นพ. สมชาย ใจดี",
        department: "อายุรกรรม",
        status: "UPCOMING",
        is_vitals_filled: false,
    },
    {
        id: 2,
        date: "15 พ.ค. 2568",
        time: "14:00 น.",
        doctor: "พญ. สุชาดา แพทย์หญิง",
        department: "หัวใจ",
        status: "CONFIRMED",
        is_vitals_filled: true,
    },
    {
        id: 3,
        date: "15 ก.ย. 2568",
        time: "09:00 น.",
        doctor: "นพ. วิทยา แสนสุข",
        department: "กายภาพบำบัด",
        status: "COMPLETED",
        is_vitals_filled: true,
    },
    {
        id: 4,
        date: "5 ต.ค. 2568",
        time: "16:00 น.",
        doctor: "พญ. รักษ์ สุขภาพ",
        department: "โภชนาการ",
        status: "CANCELLED",
        is_vitals_filled: false,
    },
];
interface PatientAppointmentListProps {
    activeTab: 'upcoming' | 'history';
}

export function PatientAppointmentList({activeTab}:PatientAppointmentListProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // ฟังก์ชันช่วยในการกำหนดสี Badge ตามสถานะ
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'UPCOMING':
            case 'CONFIRMED':
                return <Badge variant="default" className="bg-green-500 hover:bg-green-600">ยืนยันแล้ว</Badge>;
            case 'COMPLETED':
                return <Badge variant="secondary">เสร็จสิ้น</Badge>;
            case 'CANCELLED':
                return <Badge variant="destructive">ยกเลิกแล้ว</Badge>;
            default:
                return <Badge variant="outline">รอการตรวจสอบ</Badge>;
        }
    };

    // กรองรายการตาม Tab ที่เลือก
    const filteredRecords = appointmentRecords.filter(record => {
        if (activeTab === 'upcoming') {
            return record.status === 'UPCOMING' || record.status === 'CONFIRMED';
        }
        if (activeTab === 'history') {
            return record.status === 'COMPLETED' || record.status === 'CANCELLED';
        }
        return false;
    });
  return (
    <div className="space-y-4">
                {filteredRecords.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">ไม่พบรายการนัดหมายในหมวดหมู่นี้</p>
                ) : (
                    filteredRecords.map((record) => (
                        <Card key={record.id} className="p-4 space-y-3 shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h2 className="font-bold text-xl text-gray-700">นัดหมายกับ {record.doctor}</h2>
                                    <p className="text-sm text-muted-foreground">{record.department}</p>
                                </div>
                                {getStatusBadge(record.status)}
                            </div>

                            {/* รายละเอียดเวลา */}
                            <div className="flex items-center gap-4 text-sm">
                                <Clock className="h-4 w-4 text-indigo-500" />
                                <span className="font-semibold text-base">{record.date}</span>
                                <span className="text-gray-600">เวลา {record.time}</span>
                            </div>

                            {/* ปุ่ม Action ที่เปลี่ยนไปตามสถานะ */}
                            <div className="flex justify-end gap-3 pt-3 border-t mt-3">

                                {/* 1. ปุ่มสำหรับนัดหมายที่กำลังจะมาถึง (UPCOMING/CONFIRMED) */}
                                {(record.status === 'UPCOMING' || record.status === 'CONFIRMED') && (
                                    <>
                                        {/* ปุ่มกรอกข้อมูลสัญญาณชีพ */}
                                        <Link href="/patient/vitals_signs">
                                            <Button
                                                variant={record.is_vitals_filled ? 'outline' : 'default'} // ถ้ายังไม่กรอกใช้สีหลัก
                                                size="sm"
                                                disabled={record.is_vitals_filled}
                                            >
                                                <Stethoscope className="h-4 w-4 mr-2" />
                                                {record.is_vitals_filled ? 'กรอกข้อมูลแล้ว' : 'กรอกสัญญาณชีพ'}
                                            </Button>
                                        </Link>

                                        {/* ปุ่มจัดการ เลื่อน/ยกเลิก */}
                                        <Button
                                            onClick={() => setIsDialogOpen(true)}
                                            variant="ghost" // ปุ่มรอง ใช้สีจาง
                                            size="sm"
                                        >
                                            เลื่อน / ยกเลิก
                                        </Button>
                                        <Patient_Edit_Appointment
                                            open={isDialogOpen}
                                            onOpenChange={setIsDialogOpen}
                                        />
                                    </>
                                )}

                                {/* 2. ปุ่มสำหรับนัดหมายที่เสร็จสิ้นแล้ว (COMPLETED) */}
                                {record.status === 'COMPLETED' && (
                                    <Button
                                        /*onClick={() => router.push(`/patient/appointment/${record.id}`)}*/
                                        variant="outline"
                                        size="sm"
                                    >
                                        ดูรายละเอียดการรักษา
                                    </Button>
                                )}

                                {/* 3. ปุ่มสำหรับนัดหมายที่ถูกยกเลิก (CANCELLED) */}
                                {record.status === 'CANCELLED' && (
                                    <Button variant="ghost" size="sm" disabled>
                                        นัดหมายนี้ถูกยกเลิกแล้ว
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>
  )
}