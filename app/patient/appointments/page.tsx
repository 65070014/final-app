'use client';

import { useState } from 'react';
import {Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { PatientAppointmentList } from '@/components/appointment/patient_appointment_list';




export default function AppointmentHistory() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
    
    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">ตารางนัดหมายของฉัน</h1>

            {/* ส่วนควบคุม Tabs และปุ่มนัดหมายใหม่ */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                    <Button
                        onClick={() => setActiveTab('upcoming')}
                        variant={activeTab === 'upcoming' ? 'default' : 'ghost'}
                    >
                        นัดหมายที่กำลังจะมาถึง
                    </Button>
                    <Button
                        onClick={() => setActiveTab('history')}
                        variant={activeTab === 'history' ? 'default' : 'ghost'}
                    >
                        ประวัติการนัดหมาย
                    </Button>
                </div>
                <Button
                    onClick={() => router.push('/patient/appointment')} // ลิงก์ไปหน้าสร้างนัดหมาย
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Calendar className="h-4 w-4 mr-2" /> นัดหมายแพทย์ใหม่
                </Button>
            </div>

            {/* ส่วนแสดงรายการนัดหมาย */}
            <PatientAppointmentList activeTab={activeTab}/>
        </div>
    );
}